import Vapi from "@vapi-ai/web";
import { useEffect, useState } from "react";

interface TranscriptMessage{
    role: "user" | "assistant";
    text: string;
};

export const useVapi = () => {
    const [vapi, setVapi] = useState<Vapi | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);

    useEffect(() => {
        // Only for testing the VAPI API, otherwise customers will provide their own API keys.
        // Each customer has to add their own API keys, allowing them to create Agents of their own to create workflows of their own and phone numbers of their own making our app more flexible. For us learning is Whitelabeling the app.
        const vapiInstance = new Vapi("1059cf03-84ea-41ae-8e6e-acf1dedd707b");
        setVapi(vapiInstance);

        vapiInstance.on("call-start", () => {
            setIsConnected(true);
            setIsConnecting(false);
            setTranscript([]);
        });

        vapiInstance.on("call-end", () => {
            setIsConnected(false);
            setIsConnecting(false);
            setIsSpeaking(false);
        });

        vapiInstance.on("speech-start", () => {
            setIsSpeaking(true);
        });

        vapiInstance.on("speech-end", () => {
            setIsSpeaking(false);
        });

        vapiInstance.on("error", (error) => {
            console.log(error, "VAPI_Error");
            setIsConnecting(false);
        });

        vapiInstance.on("message", (message) => {
            if(message.type === "transcript" && message.transcriptType === "final"){
                setTranscript((prev) => [
                    ...prev,
                    {
                        role: message.role === "user" ? "user" : "assistant",
                        text: message.transcript,
                    }
                ]);
            }
        });
        return () => {
            vapiInstance?.stop();
        }
    }, []);

    const startCall = () => {
        setIsConnecting(true);

        if(vapi){
            //Inside of start, Which AI assistant wants to be called needs to be defined.
            // Only for testing the VAPI API, otherwise customers will provide their own Assistant IDs.
            vapi.start("b4cb36aa-00bd-46a4-9a74-487e074deab9");
        }
    }

    const endCall = () => {
        if(vapi){
            vapi.stop();
        }
    };

    return {
        isSpeaking,
        isConnecting,
        isConnected,
        transcript,
        startCall,
        endCall,
    }
};