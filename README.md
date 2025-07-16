# iris

an intelligent meeting assistant that transcribes, analyzes, and extracts action items from meetings. powered by whisper, llama3.2, and a modern next.js stack.

### features

- meeting recording and transcription  
- ai-powered meeting analysis  
- automated task extraction  
- meeting insights and summaries  
- task management integration  
- dark/light mode support  

### tech stack

- next.js 14 (app router)  
- typescript  
- tailwind css  
- shadcn/ui components  
- clerk authentication  
- local storage for data  
- openai whisper for transcription  
- ollama (llama 3.2) for local ai analysis  

### frameworks and auth

**next.js**  
react-based framework with support for app router, server components, and api routes — used for fast and scalable frontend + backend logic.

**clerk auth**  
handles user authentication with sessions, mfa, and identity provider support — integrated for secure, production-ready auth.

### ai model integration

**whisper**  
used for both live and post-meeting transcription. supports multi-language input, speaker separation, and solid accuracy.

**ollama + llama 3.2**  
runs locally using ollama, powering offline and fast analysis. extracts meeting summaries, insights, and todo tasks from the transcript.

to run llama3.2 locally:

```bash
ollama run llama3.2
````

### getting started

1. clone the repo

```bash
git clone https://github.com/yourusername/iris.git
cd iris
```

2. install dependencies

```bash
npm install
```

3. setup environment variables

create a `.env.local` file and add:

```env
OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

4. start dev server

```bash
npm run dev
```

### env variables

* `OPENAI_API_KEY`
* `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
* `CLERK_SECRET_KEY`

### contributing

pull requests are welcome. feel free to fork, tweak, and build.

### screenshots

#### landing page

![Screenshot 2025-03-07 082534](https://github.com/user-attachments/assets/5242b4d2-3eb0-4cce-bd95-16eb9f3f8e05)

#### authentication

![Screenshot 2025-03-07 082659](https://github.com/user-attachments/assets/ed226721-5350-49c6-a908-cc8445c8938f)

#### dashboard

![Screenshot 2025-03-07 082901](https://github.com/user-attachments/assets/042e5b18-74fc-4458-9c24-0c8189a9bef8)

#### uploading video screen

![Screenshot 2025-03-07 083006](https://github.com/user-attachments/assets/4c7a7128-0f96-4d16-ac3b-1a1fd759c6d8)

#### real-time transcript

![Screenshot 2025-03-07 084526](https://github.com/user-attachments/assets/2c10d0b2-f5bd-494f-9e1d-0147fe44437b)

#### summary

![Screenshot 2025-03-07 084242](https://github.com/user-attachments/assets/7fe18fb3-87e5-4649-bde8-be78ccb6f855)

#### tasks

![Screenshot 2025-03-07 084259](https://github.com/user-attachments/assets/be467733-43b2-463f-a079-ee6c423ad353)

#### discussion (translated from french sample)

![Screenshot 2025-03-07 084329](https://github.com/user-attachments/assets/14f754ac-5bdc-417f-b8c3-352a92ee7825)

#### ai chatbot (llama3.2)

![Screenshot 2025-03-07 084427](https://github.com/user-attachments/assets/f4752315-b745-4e5f-a480-e6f160d2cb93)

#### meetings screen

![Screenshot 2025-03-07 084501](https://github.com/user-attachments/assets/0136f9d6-51bc-4bac-9716-3ba418005b8d)

#### all meetings

![Screenshot 2025-03-07 084511](https://github.com/user-attachments/assets/495df72c-cafa-4f74-832c-71f4ea6e3f41)

#### settings

![Screenshot 2025-03-07 084148](https://github.com/user-attachments/assets/940ffe99-93c9-40e2-a4a6-68ab7dfd3382)

```

all lowercase. no emojis. no breakage. hope this hits the vibe perfectly — let me know if you want a `license`, `roadmap`, or `faq` section too.
```
