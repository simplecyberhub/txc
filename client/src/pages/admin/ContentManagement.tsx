import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/layouts/AdminLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  Pencil,
  Trash2,
  Loader2,
  FileText,
} from "lucide-react";

const contentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase with hyphens and no spaces"),
  content: z.string().min(1, "Content is required"),
  type: z.string().min(1, "Type is required"),
  isPublished: z.boolean().default(false),
});

type ContentFormData = z.infer<typeof contentSchema>;

interface Content {
  id: number;
  title: string;
  slug: string;
  content: string;
  type: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ContentManagement() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("list");
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  
  // Fetch content
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/admin/content'],
  });
  
  // Content form
  const form = useForm<ContentFormData>({
    resolver: zodResolver(contentSchema),
    defaultValues: {
      title: "",
      slug: "",
      content: "",
      type: "page",
      isPublished: false,
    },
  });
  
  // Set form values when editing content
  useState(() => {
    if (selectedContent) {
      form.reset({
        title: selectedContent.title,
        slug: selectedContent.slug,
        content: selectedContent.content,
        type: selectedContent.type,
        isPublished: selectedContent.isPublished,
      });
    }
  });
  
  // Create content mutation
  const createContent = useMutation({
    mutationFn: async (data: ContentFormData) => {
      const res = await apiRequest("POST", "/api/admin/content", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/content'] });
      toast({
        title: "Success",
        description: "Content created successfully",
      });
      form.reset();
      setActiveTab("list");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create content",
        variant: "destructive",
      });
    }
  });
  
  // Update content mutation
  const updateContent = useMutation({
    mutationFn: async (data: { id: number, content: ContentFormData }) => {
      const res = await apiRequest("PUT", `/api/admin/content/${data.id}`, data.content);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/content'] });
      toast({
        title: "Success",
        description: "Content updated successfully",
      });
      setSelectedContent(null);
      form.reset();
      setActiveTab("list");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update content",
        variant: "destructive",
      });
    }
  });
  
  // Handle form submissions
  const onSubmit = (data: ContentFormData) => {
    if (selectedContent) {
      updateContent.mutate({ id: selectedContent.id, content: data });
    } else {
      createContent.mutate(data);
    }
  };
  
  // Handle edit content
  const handleEditContent = (content: Content) => {
    setSelectedContent(content);
    form.reset({
      title: content.title,
      slug: content.slug,
      content: content.content,
      type: content.type,
      isPublished: content.isPublished,
    });
    setActiveTab("create");
  };
  
  // Handle new content
  const handleNewContent = () => {
    setSelectedContent(null);
    form.reset({
      title: "",
      slug: "",
      content: "",
      type: "page",
      isPublished: false,
    });
    setActiveTab("create");
  };
  
  // Get content from data
  const contents: Content[] = data?.contents || [];
  
  // Format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  // Loading state
  if (isLoading) {
    return (
      <AdminLayout title="Content Management">
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }
  
  if (error) {
    toast({
      title: "Error",
      description: "Failed to load content data",
      variant: "destructive",
    });
  }
  
  return (
    <AdminLayout title="Content Management">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Content Management</h1>
        <p className="text-gray-600">
          Manage website content, pages, and articles
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Content Management</CardTitle>
              <CardDescription>
                Create and manage content for your website
              </CardDescription>
            </div>
            <Button onClick={handleNewContent}>Create New Content</Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="list">Content List</TabsTrigger>
              <TabsTrigger value="create">{selectedContent ? "Edit Content" : "Create Content"}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="list">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contents.length > 0 ? (
                    contents.map((content) => (
                      <TableRow key={content.id}>
                        <TableCell className="font-medium">{content.title}</TableCell>
                        <TableCell className="capitalize">{content.type}</TableCell>
                        <TableCell><code className="text-xs bg-gray-100 p-1 rounded">{content.slug}</code></TableCell>
                        <TableCell>
                          {content.isPublished ? (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                              Published
                            </Badge>
                          ) : (
                            <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                              Draft
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{formatDate(content.updatedAt)}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="mr-1"
                            onClick={() => handleEditContent(content)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6">
                        <div className="flex flex-col items-center justify-center">
                          <FileText className="h-8 w-8 text-gray-300 mb-2" />
                          <p className="text-gray-500">No content found</p>
                          <Button 
                            variant="link" 
                            className="mt-2"
                            onClick={handleNewContent}
                          >
                            Create your first content
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TabsContent>
            
            <TabsContent value="create">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter content title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="slug"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Slug</FormLabel>
                          <FormControl>
                            <Input placeholder="enter-content-slug" {...field} />
                          </FormControl>
                          <FormDescription>
                            URL-friendly version of the title (lowercase, no spaces, use hyphens)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Content Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select content type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="page">Page</SelectItem>
                              <SelectItem value="post">Blog Post</SelectItem>
                              <SelectItem value="faq">FAQ</SelectItem>
                              <SelectItem value="policy">Policy</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="isPublished"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-8">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Published</FormLabel>
                            <FormDescription>
                              Make this content visible to users
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter content here..." 
                            className="min-h-[300px] font-mono"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          You can use HTML formatting in the content
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setSelectedContent(null);
                        form.reset();
                        setActiveTab("list");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createContent.isPending || updateContent.isPending}
                    >
                      {(createContent.isPending || updateContent.isPending) ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                          {selectedContent ? "Updating..." : "Creating..."}
                        </>
                      ) : (
                        selectedContent ? "Update Content" : "Create Content"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
