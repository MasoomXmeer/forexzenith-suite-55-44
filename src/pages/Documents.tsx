import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MobileHeader } from "@/components/Layout/MobileHeader";

interface Document {
  id: string;
  type: string;
  status: "verified" | "pending" | "rejected";
}

export default function Documents() {
  const [documents] = useState<Document[]>([
    { id: "1", type: "Proof of Identity", status: "verified" },
    { id: "2", type: "Proof of Identity", status: "verified" },
    { id: "3", type: "Proof of Identity", status: "verified" }
  ]);

  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 1;
  const totalEntries = 3;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-green-600 text-white";
      case "pending":
        return "bg-yellow-500 text-black";
      case "rejected":
        return "bg-red-600 text-white";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <MobileHeader title="" showNotifications={false} />
      
      <div className="p-4">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-foreground">DOCUMENT TYPE</h1>
            <span className="text-sm font-medium text-foreground">STATUS</span>
          </div>
        </div>

        {/* Document List */}
        <div className="space-y-3 mb-6">
          {documents.map((doc) => (
            <Card key={doc.id} className="p-4 border-border bg-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 border border-muted rounded flex items-center justify-center">
                    <span className="text-xs">✓</span>
                  </div>
                  <span className="text-foreground font-medium">{doc.type}</span>
                </div>
                <Badge className={`${getStatusColor(doc.status)} border-0`}>
                  Verified
                </Badge>
              </div>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        <div className="text-center mb-6">
          <p className="text-sm text-muted-foreground mb-4">
            Showing 1 to {totalEntries} of {totalEntries} entries
          </p>
          
          <div className="flex items-center justify-center gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              className="h-10 w-10 border border-border"
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon"
              className="h-10 w-10 border border-border"
              disabled={currentPage === 1}
            >
              «
            </Button>
            
            <Button 
              variant="default"
              className="h-10 w-10 bg-primary text-primary-foreground"
            >
              {currentPage}
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon"
              className="h-10 w-10 border border-border"
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon"
              className="h-10 w-10 border border-border"
              disabled={currentPage === totalPages}
            >
              »
            </Button>
          </div>
        </div>

        {/* Risk Warning */}
        <Card className="p-4 bg-card border-border mb-6">
          <p className="text-sm text-muted-foreground">
            <span className="text-primary font-medium">Risk Warning:</span> Your capital is at risk. Leveraged 
            products may not be suitable for everyone. 
            Please consider our{" "}
            <span className="text-primary underline">Risk Disclosure</span>.
          </p>
        </Card>

        {/* Footer Links */}
        <div className="grid grid-cols-2 gap-4 text-center">
          <Button variant="link" className="text-sm text-primary p-0">
            Privacy Policy
          </Button>
          <Button variant="link" className="text-sm text-primary p-0">
            Cookie Policy
          </Button>
          <Button variant="link" className="text-sm text-primary p-0">
            Vulnerability Policy
          </Button>
          <Button variant="link" className="text-sm text-primary p-0">
            Terms and Conditions
          </Button>
        </div>

        {/* Bottom Navigation Icons */}
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4">
          <div className="flex items-center justify-around">
            <div className="flex flex-col items-center gap-1">
              <div className="w-6 h-6 bg-muted rounded"></div>
              <span className="text-xs text-muted-foreground">Home</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-6 h-6 bg-muted rounded"></div>
              <span className="text-xs text-muted-foreground">Accounts</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-6 h-6 bg-muted rounded"></div>
              <span className="text-xs text-muted-foreground">Deposit</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-6 h-6 bg-muted rounded"></div>
              <span className="text-xs text-muted-foreground">Trade</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-6 h-6 bg-muted rounded"></div>
              <span className="text-xs text-muted-foreground">More</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}