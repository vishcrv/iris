"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FileAudio, Clock, Loader2, MoreVertical, Trash2, BrainCircuit, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Import Meeting type from a shared types file or define it here
type Meeting = {
  id: string;
  title: string;
  date: string;
  status: string;
  progress: number;
  url: string;
  blob?: Blob;
  transcript?: string;
  analysis?: {
    discussions: string;
    summary: string;
    tasks: string;
  };
  uploadedBy: {
    name: string;
    email: string;
  };
};

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  // Initialize IndexedDB and load meetings
  useEffect(() => {
    const loadData = async () => {
      await loadMeetingsFromDB();
    };
    loadData();
  }, []);

  const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('meetingsDB', 2);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  };

  const loadMeetingsFromDB = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const db = await openDB();
      const transaction = db.transaction(['meetings'], 'readonly');
      const store = transaction.objectStore('meetings');
      const request = store.getAll();

      request.onsuccess = () => {
        const meetings = request.result;
        meetings.forEach(meeting => {
          if (meeting.blob) {
            meeting.url = URL.createObjectURL(meeting.blob);
          }
        });
        // Sort meetings by date (most recent first)
        meetings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setMeetings(meetings);
        setIsLoading(false);
      };

      request.onerror = () => {
        throw new Error('Failed to load meetings from database');
      };
    } catch (error) {
      console.error('Error loading meetings:', error);
      setError('Failed to load meetings. Please try again.');
      setIsLoading(false);
    }
  };

  const handleDeleteMeeting = async (meeting: Meeting) => {
    try {
      const db = await openDB();
      const transaction = db.transaction(['meetings'], 'readwrite');
      const store = transaction.objectStore('meetings');
      await store.delete(meeting.id);
      
      setMeetings(prev => prev.filter(m => m.id !== meeting.id));
      
      if (meeting.url) {
        URL.revokeObjectURL(meeting.url);
      }
    } catch (error) {
      console.error('Error deleting meeting:', error);
    }
  };

  const handlePlayMedia = async (meeting: Meeting) => {
    router.push(`/dashboard/meetings/${meeting.id}`);
  };

  const handleAskAI = (meeting: Meeting) => {
    router.push(`/dashboard?meeting=${meeting.id}&chat=true`);
  };

  const filteredMeetings = meetings.filter(meeting =>
    meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    meeting.uploadedBy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    meeting.uploadedBy.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] p-8">
        <div className="text-destructive mb-4">
          <span className="text-lg font-medium">{error}</span>
        </div>
        <Button onClick={loadMeetingsFromDB}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">All Meetings</h1>
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search meetings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button onClick={loadMeetingsFromDB} variant="outline" size="sm">
              Refresh
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-[400px]">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading meetings...</p>
            </div>
          </div>
        ) : filteredMeetings.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[400px] text-center">
            <FileAudio className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No meetings found</h3>
            <p className="text-sm text-muted-foreground">
              {searchQuery ? 'Try adjusting your search query' : 'Upload a meeting recording to get started'}
            </p>
          </div>
        ) : (
          <AnimatePresence>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredMeetings.map((meeting) => (
                <motion.div
                  key={meeting.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <FileAudio className="h-4 w-4 text-primary" />
                          <h3 className="font-medium truncate">{meeting.title}</h3>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <Clock className="h-3 w-3" />
                          <span>{meeting.date}</span>
                          <span className="text-xs px-2 py-0.5 bg-primary/10 rounded-full">
                            {meeting.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                          <span>Uploaded by: {meeting.uploadedBy?.name}</span>
                          <span>•</span>
                          <span className="truncate">{meeting.uploadedBy?.email}</span>
                        </div>
                        <div className="space-y-1">
                          <Progress value={meeting.progress} className="h-1" />
                          {meeting.progress < 100 && (
                            <p className="text-xs text-muted-foreground text-right">
                              {meeting.progress}%
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePlayMedia(meeting)}
                          disabled={meeting.status === "Uploading" || meeting.status === "Processing"}
                          className="text-sm"
                        >
                          {meeting.status === "Uploading" || meeting.status === "Processing" ? (
                            <div className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Processing
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span>View Details</span>
                            </div>
                          )}
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem onClick={() => handleDeleteMeeting(meeting)}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAskAI(meeting)}>
                              <BrainCircuit className="mr-2 h-4 w-4" />
                              Ask AI
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
} 