"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Meeting } from "@/types/meeting";
import { 
  FileAudio, 
  Clock, 
  Loader2, 
  ArrowLeft, 
  Edit, 
  Save, 
  X,
  FileText,
  MessageSquare,
  ListTodo,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Volume1,
  VolumeX,
  Maximize2
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function MeetingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const meetingId = params.id as string;
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("summary");
  
  // Editing states
  const [isEditing, setIsEditing] = useState<'summary' | 'discussions' | 'tasks' | null>(null);
  const [editContent, setEditContent] = useState("");
  
  // Media player states
  const mediaRef = useRef<HTMLAudioElement | HTMLVideoElement | null>(null);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(-1);

  useEffect(() => {
    loadMeeting();
  }, [meetingId]);

  const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('meetingsDB', 2);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  };

  const loadMeeting = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const db = await openDB();
      const transaction = db.transaction(['meetings'], 'readonly');
      const store = transaction.objectStore('meetings');
      const request = store.get(meetingId);

      request.onsuccess = () => {
        const meeting = request.result;
        if (meeting) {
          if (meeting.blob) {
            meeting.url = URL.createObjectURL(meeting.blob);
          }
          setMeeting(meeting);
        } else {
          setError('Meeting not found');
        }
        setIsLoading(false);
      };

      request.onerror = () => {
        throw new Error('Failed to load meeting from database');
      };
    } catch (error) {
      console.error('Error loading meeting:', error);
      setError('Failed to load meeting. Please try again.');
      setIsLoading(false);
    }
  };

  const handleEdit = (section: 'summary' | 'discussions' | 'tasks') => {
    if (!meeting?.analysis) return;
    
    setIsEditing(section);
    setEditContent(meeting.analysis[section] || '');
  };

  const handleSave = async () => {
    if (!meeting || !isEditing) return;

    try {
      // Create updated meeting object
      const updatedMeeting = { 
        ...meeting,
        analysis: {
          ...meeting.analysis,
          [isEditing]: editContent
        }
      };

      // Save to IndexedDB
      const db = await openDB();
      const transaction = db.transaction(['meetings'], 'readwrite');
      const store = transaction.objectStore('meetings');
      await store.put(updatedMeeting);
      
      // Update local state
      setMeeting(updatedMeeting);
      setIsEditing(null);
    } catch (error) {
      console.error('Error saving changes:', error);
    }
  };

  const handleCancel = () => {
    setIsEditing(null);
  };

  const renderTasks = (tasksText: string) => {
    if (!tasksText) return <p className="text-muted-foreground">No tasks available</p>;
    
    // Parse tasks from the text
    const taskLines = tasksText.split('\n').filter(line => line.trim());
    
    return (
      <div className="space-y-4">
        {taskLines.map((task, index) => (
          <Card key={index} className="p-4">
            <p>{task}</p>
          </Card>
        ))}
      </div>
    );
  };

  // Media player functions
  const togglePlay = () => {
    if (!mediaRef.current) return;
    
    if (isPlaying) {
      mediaRef.current.pause();
    } else {
      mediaRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (!mediaRef.current) return;
    
    setCurrentTime(mediaRef.current.currentTime);
    updateCurrentWord(mediaRef.current.currentTime);
  };

  const updateCurrentWord = (currentTime: number) => {
    if (!meeting?.wordTimings) return;
    
    const index = meeting.wordTimings.findIndex(
      (timing) => currentTime >= timing.start && currentTime <= timing.end
    );
    
    if (index !== -1) {
      setCurrentWordIndex(index);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!mediaRef.current) return;
    
    const newTime = parseFloat(e.target.value);
    mediaRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!mediaRef.current) return;
    
    const newVolume = parseFloat(e.target.value);
    mediaRef.current.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (!mediaRef.current) return;
    
    const newMuted = !isMuted;
    mediaRef.current.muted = newMuted;
    setIsMuted(newMuted);
  };

  const handlePlaybackRateChange = (rate: number) => {
    if (!mediaRef.current) return;
    
    mediaRef.current.playbackRate = rate;
    setPlaybackRate(rate);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleMediaLoaded = () => {
    if (!mediaRef.current) return;
    
    setDuration(mediaRef.current.duration);
  };

  const renderTranscript = () => {
    if (!meeting?.transcript) return null;
    
    // If we have word timings, show interactive transcript
    if (meeting.wordTimings && meeting.wordTimings.length > 0) {
      return (
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <p className="leading-relaxed">
            {meeting.wordTimings.map((timing, index) => (
              <span
                key={index}
                className={cn(
                  "inline-block transition-colors duration-200",
                  index === currentWordIndex
                    ? "bg-primary/20 rounded px-1"
                    : "px-[1px]"
                )}
                onClick={() => {
                  if (mediaRef.current) {
                    mediaRef.current.currentTime = timing.start;
                    setCurrentTime(timing.start);
                  }
                }}
                style={{ cursor: "pointer" }}
              >
                {timing.word}{" "}
              </span>
            ))}
          </p>
        </div>
      );
    }
    
    // For transcripts without word timings
    return (
      <div className="prose prose-sm max-w-none dark:prose-invert">
        {meeting.transcript.split('\n').map((paragraph, index) => (
          <p key={index} className="mb-4 leading-relaxed">
            {paragraph}
          </p>
        ))}
      </div>
    );
  };

  // Add fullscreen functionality
  const handleFullscreen = () => {
    if (!mediaRef.current) return;
    
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      mediaRef.current.requestFullscreen();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)] p-8">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading meeting...</p>
        </div>
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] p-8">
        <div className="text-destructive mb-4">
          <span className="text-lg font-medium">{error || 'Meeting not found'}</span>
        </div>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Meetings
        </Button>
      </div>

      <div className="flex flex-col gap-6">
        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-semibold mb-2">{meeting.title}</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{meeting.date}</span>
                <span className="text-xs px-2 py-0.5 bg-primary/10 rounded-full">
                  {meeting.status}
                </span>
              </div>
            </div>
            {meeting.url && (
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2"
                onClick={() => setIsMediaModalOpen(true)}
              >
                <Play className="h-4 w-4" />
                Play Media
              </Button>
            )}
          </div>

          <Tabs defaultValue="summary" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="summary" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Summary
              </TabsTrigger>
              <TabsTrigger value="discussions" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Discussion
              </TabsTrigger>
              <TabsTrigger value="tasks" className="flex items-center gap-2">
                <ListTodo className="h-4 w-4" />
                Tasks
              </TabsTrigger>
              {meeting.transcript && (
                <TabsTrigger value="transcript" className="flex items-center gap-2">
                  <FileAudio className="h-4 w-4" />
                  Transcript
                </TabsTrigger>
              )}
            </TabsList>
            
            <TabsContent value="summary" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-medium">Meeting Summary</h2>
                {isEditing !== 'summary' && (
                  <Button variant="outline" size="sm" onClick={() => handleEdit('summary')}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
              </div>
              
              {isEditing === 'summary' ? (
                <div className="space-y-4">
                  <Textarea 
                    value={editContent} 
                    onChange={(e) => setEditContent(e.target.value)}
                    className="min-h-[200px]"
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={handleCancel}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSave}>
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  {meeting.analysis?.summary ? (
                    <p className="whitespace-pre-line">{meeting.analysis.summary}</p>
                  ) : (
                    <p className="text-muted-foreground">No summary available</p>
                  )}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="discussions" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-medium">Discussion Points</h2>
                {isEditing !== 'discussions' && (
                  <Button variant="outline" size="sm" onClick={() => handleEdit('discussions')}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
              </div>
              
              {isEditing === 'discussions' ? (
                <div className="space-y-4">
                  <Textarea 
                    value={editContent} 
                    onChange={(e) => setEditContent(e.target.value)}
                    className="min-h-[200px]"
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={handleCancel}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSave}>
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  {meeting.analysis?.discussions ? (
                    <p className="whitespace-pre-line">{meeting.analysis.discussions}</p>
                  ) : (
                    <p className="text-muted-foreground">No discussion points available</p>
                  )}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="tasks" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-medium">Action Items</h2>
                {isEditing !== 'tasks' && (
                  <Button variant="outline" size="sm" onClick={() => handleEdit('tasks')}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
              </div>
              
              {isEditing === 'tasks' ? (
                <div className="space-y-4">
                  <Textarea 
                    value={editContent} 
                    onChange={(e) => setEditContent(e.target.value)}
                    className="min-h-[200px]"
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={handleCancel}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSave}>
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                renderTasks(meeting.analysis?.tasks || '')
              )}
            </TabsContent>

            <TabsContent value="transcript" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-medium">Transcript</h2>
              </div>
              {renderTranscript()}
            </TabsContent>
          </Tabs>
        </Card>
      </div>

      {/* Media Player Modal */}
      {isMediaModalOpen && meeting.url && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg shadow-lg max-w-5xl w-full max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-medium">{meeting.title}</h3>
              <Button variant="ghost" size="sm" onClick={() => setIsMediaModalOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 flex-1 min-h-0">
                {/* Left column: Video/Audio player - Now 3/5 of the width */}
                <div className="flex flex-col gap-4 md:col-span-3">
                  <div className="relative bg-black aspect-video rounded-lg overflow-hidden">
                    {meeting.blob?.type.includes('video') ? (
                      <video
                        ref={mediaRef as React.RefObject<HTMLVideoElement>}
                        src={meeting.url}
                        className="w-full h-full"
                        onTimeUpdate={handleTimeUpdate}
                        onLoadedMetadata={handleMediaLoaded}
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                          <FileAudio className="h-12 w-12 text-primary" />
                        </div>
                        <audio
                          ref={mediaRef as React.RefObject<HTMLAudioElement>}
                          src={meeting.url}
                          onTimeUpdate={handleTimeUpdate}
                          onLoadedMetadata={handleMediaLoaded}
                          onPlay={() => setIsPlaying(true)}
                          onPause={() => setIsPlaying(false)}
                        />
                      </div>
                    )}
                    
                    {/* Fullscreen button */}
                    {meeting.blob?.type.includes('video') && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white"
                        onClick={handleFullscreen}
                      >
                        <Maximize2 className="h-5 w-5" />
                      </Button>
                    )}
                  </div>
                  
                  {/* Controls */}
                  <div className="flex flex-col gap-2">
                    {/* Progress bar */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{formatTime(currentTime)}</span>
                      <input
                        type="range"
                        min="0"
                        max={duration || 100}
                        value={currentTime}
                        onChange={handleSeek}
                        className="flex-1 h-2 rounded-full bg-secondary appearance-none cursor-pointer"
                      />
                      <span className="text-sm">{formatTime(duration)}</span>
                    </div>
                    
                    {/* Playback controls */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => {
                          if (mediaRef.current) {
                            mediaRef.current.currentTime = Math.max(0, currentTime - 10);
                          }
                        }}>
                          <SkipBack className="h-5 w-5" />
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-10 w-10 rounded-full"
                          onClick={togglePlay}
                        >
                          {isPlaying ? (
                            <Pause className="h-5 w-5" />
                          ) : (
                            <Play className="h-5 w-5" />
                          )}
                        </Button>
                        
                        <Button variant="ghost" size="sm" onClick={() => {
                          if (mediaRef.current) {
                            mediaRef.current.currentTime = Math.min(duration, currentTime + 10);
                          }
                        }}>
                          <SkipForward className="h-5 w-5" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        {/* Volume control */}
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={toggleMute}>
                            {isMuted ? (
                              <VolumeX className="h-5 w-5" />
                            ) : volume < 0.5 ? (
                              <Volume1 className="h-5 w-5" />
                            ) : (
                              <Volume2 className="h-5 w-5" />
                            )}
                          </Button>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={isMuted ? 0 : volume}
                            onChange={handleVolumeChange}
                            className="w-24 h-2 rounded-full bg-secondary appearance-none cursor-pointer"
                          />
                        </div>
                        
                        {/* Playback speed */}
                        <div className="flex items-center gap-2">
                          <span className="text-sm">Speed:</span>
                          <select
                            value={playbackRate}
                            onChange={(e) => handlePlaybackRateChange(parseFloat(e.target.value))}
                            className="bg-background border rounded px-2 py-1 text-sm"
                          >
                            <option value="0.5">0.5x</option>
                            <option value="0.75">0.75x</option>
                            <option value="1">1x</option>
                            <option value="1.25">1.25x</option>
                            <option value="1.5">1.5x</option>
                            <option value="2">2x</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Right column: Transcript - Now 2/5 of the width */}
                <div className="bg-muted rounded-lg flex flex-col min-h-0 overflow-hidden md:col-span-2">
                  <div className="p-3 border-b flex items-center justify-between sticky top-0 bg-muted z-10">
                    <h4 className="text-sm font-medium">Transcript</h4>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {renderTranscript()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 