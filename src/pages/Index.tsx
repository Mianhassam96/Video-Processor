import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Copy, Download, Music, VideoOff } from "lucide-react";

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

  const copyVideoLink = () => {
    if (videoUrl) {
      navigator.clipboard.writeText(videoUrl).then(() => {
        toast({
          title: "Link copied!",
          description: "Video link has been copied to clipboard.",
        });
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Video Processing App
            </h1>
            <p className="text-muted-foreground">
              Upload, process, and download your videos with ease
            </p>
          </div>
          
          <div className="space-y-6">
            <Input
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              className="w-full"
            />
            
            {videoUrl && (
              <div className="space-y-6">
                <video 
                  src={videoUrl} 
                  controls 
                  className="w-full rounded-lg shadow-lg aspect-video bg-black"
                />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button 
                    onClick={downloadVideo}
                    className="w-full"
                    variant="default"
                  >
                    <Download className="mr-2" />
                    Download Original
                  </Button>
                  <Button 
                    onClick={downloadAudioOnly}
                    className="w-full"
                    variant="secondary"
                  >
                    <Music className="mr-2" />
                    Extract Audio
                  </Button>
                  <Button 
                    onClick={downloadVideoWithoutAudio}
                    className="w-full"
                    variant="secondary"
                  >
                    <VideoOff className="mr-2" />
                    Remove Audio
                  </Button>
                  <Button 
                    onClick={copyVideoLink}
                    className="w-full"
                    variant="outline"
                  >
                    <Copy className="mr-2" />
                    Copy Link
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <footer className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-2">MultiMain</h2>
          <p className="text-blue-100">
            Transforming your video experience, one file at a time
          </p>
          <div className="mt-4 text-sm text-blue-200">
            © {new Date().getFullYear()} MultiMain. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;