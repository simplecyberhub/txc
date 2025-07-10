import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, UploadCloud } from "lucide-react";
import { queryClient } from "@/lib/queryClient";

const kycSchema = z.object({
  documentType: z.string().min(1, "Document type is required"),
  documentId: z.string().min(1, "Document ID number is required"),
});

type KYCFormData = z.infer<typeof kycSchema>;

export default function KYCForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<KYCFormData>({
    resolver: zodResolver(kycSchema),
    defaultValues: {
      documentType: "",
      documentId: "",
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const onSubmit = async (data: KYCFormData) => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please upload a document file",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("documentType", data.documentType);
      formData.append("documentId", data.documentId);
      formData.append("document", selectedFile);

      const response = await fetch("/api/kyc", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit KYC documents");
      }

      const result = await response.json();

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/kyc/status"] });

      toast({
        title: "Success",
        description: "Your KYC documents have been submitted for verification",
      });

      form.reset();
      setSelectedFile(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit KYC documents",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="documentType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Document Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="passport">Passport</SelectItem>
                  <SelectItem value="nationalId">National ID</SelectItem>
                  <SelectItem value="driverLicense">
                    Driver's License
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="documentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Document ID Number</FormLabel>
              <FormControl>
                <Input placeholder="Enter your document ID number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <FormLabel>Upload Document</FormLabel>
          <div
            onClick={triggerFileInput}
            className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition ${
              selectedFile ? "border-primary" : "border-gray-300"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleFileChange}
              title="Upload your document file"
              placeholder="Select a document file"
            />
            <UploadCloud className="h-10 w-10 text-gray-400 mb-2" />
            {selectedFile ? (
              <p className="text-sm text-primary font-medium">
                {selectedFile.name}
              </p>
            ) : (
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Drag and drop your document, or click to browse
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Supported formats: JPG, PNG, PDF (max 5MB)
                </p>
              </div>
            )}
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-primary text-white"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
            </>
          ) : (
            "Submit Documents"
          )}
        </Button>
      </form>
    </Form>
  );
}
