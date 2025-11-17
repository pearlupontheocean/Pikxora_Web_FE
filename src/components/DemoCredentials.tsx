import { Card } from "@/components/ui/card";
import { Info, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

const demoAccounts = [
  { email: "admin@pikxora.com", password: "admin123", role: "Admin" },
  { email: "studio1@pikxora.com", password: "studio123", role: "Studio (Verified)" },
  { email: "studio2@pikxora.com", password: "studio123", role: "Studio (Verified)" },
  { email: "artist@pikxora.com", password: "artist123", role: "Artist" },
  { email: "investor@pikxora.com", password: "investor123", role: "Investor" },
];

export const DemoCredentials = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyCredentials = (email: string, password: string, index: number) => {
    navigator.clipboard.writeText(`Email: ${email}\nPassword: ${password}`);
    setCopiedIndex(index);
    toast.success("Credentials copied to clipboard!");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <Card className="p-6 border-blue-500/50 bg-blue-500/5">
      <div className="flex items-start gap-3 mb-4">
        <Info className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="font-semibold text-blue-400 mb-1">Demo Accounts</h3>
          <p className="text-sm text-muted-foreground">
            Quick login credentials for testing different roles
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {demoAccounts.map((account, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/50"
          >
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{account.email}</div>
              <div className="text-xs text-muted-foreground">
                {account.role} • Password: {account.password}
              </div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => copyCredentials(account.email, account.password, index)}
              className="flex-shrink-0 ml-2"
            >
              {copiedIndex === index ? (
                <Check className="h-4 w-4 text-green-400" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground mt-4">
        💡 Tip: Create these accounts through the signup form to test the full flow
      </p>
    </Card>
  );
};
