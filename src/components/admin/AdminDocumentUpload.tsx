import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, Loader2, Upload, FileCheck } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { fetchAdminUsers } from "@/services/properties";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { apiFetch } from "@/lib/api";
import { compressImage } from "@/lib/image-compress";

const AdminDocumentUpload = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [targetUserId, setTargetUserId] = useState("");
  const [docType, setDocType] = useState("LEASE");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await fetchAdminUsers();
        if (response.data) setUsers(response.data);
      } catch (error) {
        console.error("Failed to fetch users", error);
      }
    };
    loadUsers();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !targetUserId || !docType) {
      toast({ title: "Error", description: "Please fill all fields and select a file.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const compressedFile = await compressImage(file);
      const formData = new FormData();
      formData.append("file", compressedFile);
      formData.append("type", docType);
      formData.append("targetUserId", targetUserId);

      // Using raw apiFetch as it handles authorization headers automatically
      await apiFetch("/api/documents/upload", {
        method: "POST",
        body: formData,
        // Don't set Content-Type header when using FormData; the browser will set it with the correct boundary.
      });

      toast({ title: "Success", description: "Document uploaded successfully for user." });
      navigate("/admin");
    } catch (error) {
      toast({ title: "Error", description: "Failed to upload document.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 pt-24 pb-12">
        <div className="container max-w-2xl mx-auto px-4">
          <Button variant="ghost" onClick={() => navigate("/admin")} className="mb-6">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <Card className="border-border/50 shadow-primary-sm overflow-hidden">
            <div className="h-2 gradient-primary" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-primary" />
                Upload Document
              </CardTitle>
              <CardDescription>
                Upload a document (ID, Lease, etc.) on behalf of a specific user.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpload} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="targetUser">Target User</Label>
                  <Select onValueChange={setTargetUserId} value={targetUserId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a user (Landlord/Student)" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.name} ({u.role.toLowerCase()}) - {u.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="docType">Document Type</Label>
                  <Select onValueChange={setDocType} value={docType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LEASE">Lease Agreement</SelectItem>
                      <SelectItem value="ID_CARD">ID Card</SelectItem>
                      <SelectItem value="UTILITY_BILL">Utility Bill</SelectItem>
                      <SelectItem value="TRANSCRIPT">Transcript</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="file">File (PDF, JPG, PNG)</Label>
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="file-upload"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {file ? (
                          <>
                            <FileCheck className="w-8 h-8 text-primary mb-2" />
                            <p className="text-sm font-medium">{file.name}</p>
                            <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                          </>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                            <p className="text-sm font-medium">Click to select or drag and drop</p>
                            <p className="text-xs text-muted-foreground">PDF, PNG, JPG (max 10MB)</p>
                          </>
                        )}
                      </div>
                      <input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                      />
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <Button type="button" variant="outline" onClick={() => navigate("/admin")} disabled={isLoading}>
                    Cancel
                  </Button>
                  <Button type="submit" className="gradient-primary" disabled={isLoading || !file || !targetUserId}>
                    {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                    Upload Document
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDocumentUpload;
