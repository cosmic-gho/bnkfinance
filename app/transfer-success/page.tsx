"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

export default function TransferSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/dashboard");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="container mx-auto py-20 max-w-md">
      <Card className="text-center border-green-200 shadow-lg">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-20 w-20 text-green-500 animate-in zoom-in duration-300" />
          </div>
          <CardTitle className="text-2xl text-green-700">Transfer Successful!</CardTitle>
          <CardDescription>
            Your transaction has been processed successfully.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            Redirecting to dashboard in {countdown} seconds...
          </p>
          <div className="flex flex-col gap-3">
            <Button 
              className="w-full bg-green-600 hover:bg-green-700" 
              onClick={() => router.push("/dashboard")}
            >
              Go to Dashboard Now
            </Button>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => router.push("/wire-transfer")}
            >
              Make Another Transfer
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
