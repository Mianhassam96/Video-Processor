import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('video/')) {
        setVideoFile(file);
        const url = URL.createObjectURL(file);
        setVideoUrl(url);
        toast({
          title: "Video uploaded successfully",
          description: "You can now download or process the video.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please upload a video file.",
        });
      }
    }
  };

  const downloadVideo = () => {
    if (videoUrl) {
      const a = document.createElement('a');
      a.href = videoUrl;
      a.download = videoFile?.name || 'video';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const downloadAudioOnly = async () => {
    if (videoFile) {
      try {
        const video = document.createElement('video');
        video.src = videoUrl;
        
        const audioContext = new AudioContext();
        const mediaElement = audioContext.createMediaElementSource(video);
        const destination = audioContext.createMediaStreamDestination();
        mediaElement.connect(destination);

        const mediaRecorder = new MediaRecorder(destination.stream);
        const chunks: BlobPart[] = [];

        mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'audio/wav' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'audio.wav';
          a.click();
        };

        video.play();
        mediaRecorder.start();
        video.onended = () => mediaRecorder.stop();
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error extracting audio",
          description: "There was an error processing the audio.",
        });
      }
    }
  };

  const downloadVideoWithoutAudio = async () => {
    if (videoFile) {
      try {
        const video = document.createElement('video');
        video.src = videoUrl;
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        video.onloadedmetadata = () => {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          
          const mediaStream = canvas.captureStream();
          const mediaRecorder = new MediaRecorder(mediaStream);
          const chunks: BlobPart[] = [];
          
          mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
          mediaRecorder.onstop = () => {
            const blob = new Blob(chunks, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'video-no-audio.webm';
            a.click();
          };
          
          video.play();
          mediaRecorder.start();
          
          const drawVideo = () => {
            if (ctx) {
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              if (!video.ended) {
                requestAnimationFrame(drawVideo);
              } else {
                mediaRecorder.stop();
              }
            }
          };
          
          drawVideo();
        };
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error processing video",
          description: "There was an error removing audio from the video.",
        });
      }
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-center">Video Processing App</h1>
        
        <div className="space-y-4">
          <Input
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            className="w-full"
          />
          
          {videoUrl && (
            <div className="space-y-4">
              <video 
                src={videoUrl} 
                controls 
                className="w-full rounded-lg shadow-lg"
              />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button onClick={downloadVideo}>
                  Download Original
                </Button>
                <Button onClick={downloadAudioOnly}>
                  Download Audio Only
                </Button>
                <Button onClick={downloadVideoWithoutAudio}>
                  Download Without Audio
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;