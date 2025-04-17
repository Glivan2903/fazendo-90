
import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

interface ErrorDisplayProps {
  title: string;
  message: string;
  onRetry?: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ title, message, onRetry }) => {
  return (
    <Card className="border-red-200 bg-red-50">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center text-center gap-2">
          <AlertCircle className="h-10 w-10 text-red-500" />
          <h3 className="text-lg font-semibold text-red-800">{title}</h3>
          <p className="text-red-600">{message}</p>
        </div>
      </CardContent>
      {onRetry && (
        <CardFooter className="justify-center pb-6">
          <Button 
            onClick={onRetry}
            className="bg-red-600 hover:bg-red-700"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Tentar novamente
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default ErrorDisplay;
