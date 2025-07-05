
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const settingSchema = z.object({
  key: z.string().min(1, "Key is required"),
  value: z.string().min(1, "Value is required"),
  type: z.string(),
});

type SettingFormData = z.infer<typeof settingSchema>;

const defaultSettings = [
  // General settings
  { key: "platform.name", value: "TradeXCapital", type: "system" },
  { key: "platform.description", value: "Your Trusted Trading Platform", type: "system" },
  { key: "maintenance.mode", value: "false", type: "system" },
  { key: "support.email", value: "support@tradexcapital.com", type: "system" },
  
  // Trading settings
  { key: "trading.min_deposit", value: "100", type: "trading" },
  { key: "trading.max_withdrawal", value: "50000", type: "trading" },
  { key: "trading.leverage.max", value: "100", type: "trading" },
  { key: "trading.commission", value: "0.1", type: "trading" },
  { key: "trading.stop_loss.required", value: "true", type: "trading" },
  
  // Email settings
  { key: "email.from_name", value: "TradeXCapital", type: "email" },
  { key: "email.from_address", value: "noreply@tradexcapital.com", type: "email" },
  { key: "email.verification_required", value: "true", type: "email" },
  { key: "email.welcome_template", value: "Welcome to TradeXCapital!", type: "email" }
];

export default function AdminSettings() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("general");
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<SettingFormData>({
    resolver: zodResolver(settingSchema),
    defaultValues: {
      key: "",
      value: "",
      type: "system",
    },
  });

  const { data: settings = [], isLoading } = useQuery({
    queryKey: ['/api/admin/settings'],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/settings");
      const data = await response.json();
      return data.success ? data.settings : [];
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: SettingFormData) => {
      const response = await apiRequest("POST", "/api/admin/settings", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/settings'] });
      toast({
        title: "Success",
        description: "Setting saved successfully",
      });
      form.reset();
      setEditingId(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save setting",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: SettingFormData) => {
    mutation.mutate({
      ...data,
      type: activeTab === "general" ? "system" : activeTab,
    });
  };

  const filterSettingsByType = (type: string) => {
    return settings.filter(setting => 
      type === "system" ? setting.type === "system" : setting.type === type
    );
  };

  const initializeDefaultSettings = async () => {
    for (const setting of defaultSettings) {
      if (!settings.find(s => s.key === setting.key)) {
        await mutation.mutateAsync(setting);
      }
    }
  };

  const renderSettingsList = (filteredSettings: any[]) => {
    if (filteredSettings.length === 0 && !isLoading) {
      return (
        <div className="text-center py-8 text-gray-500">
          No settings found
          <Button 
            className="mt-4"
            onClick={() => initializeDefaultSettings()}
          >
            Initialize Default Settings
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {filteredSettings.map((setting) => (
          <div
            key={setting.key}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
          >
            <div>
              <h4 className="font-medium text-gray-900">{setting.key}</h4>
              <p className="text-sm text-gray-500">{setting.value}</p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setEditingId(setting.key);
                form.reset({
                  key: setting.key,
                  value: setting.value,
                  type: setting.type,
                });
              }}
            >
              Edit
            </Button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>System Settings</CardTitle>
            <CardDescription>
              Configure system-wide settings for TradeXCapital
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="trading">Trading</TabsTrigger>
                <TabsTrigger value="email">Email</TabsTrigger>
              </TabsList>

              <TabsContent value="general">
                {renderSettingsList(filterSettingsByType("system"))}
              </TabsContent>

              <TabsContent value="trading">
                {renderSettingsList(filterSettingsByType("trading"))}
              </TabsContent>

              <TabsContent value="email">
                {renderSettingsList(filterSettingsByType("email"))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card>
          <CardHeader>
            <CardTitle>Add Setting</CardTitle>
            <CardDescription>
              Create or edit system settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="key"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Key</FormLabel>
                      <FormControl>
                        <Input placeholder="Setting key" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Value</FormLabel>
                      <FormControl>
                        <Input placeholder="Setting value" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Setting"
                  )}
                </Button>

                {editingId && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setEditingId(null);
                      form.reset({
                        key: "",
                        value: "",
                        type: activeTab === "general" ? "system" : activeTab,
                      });
                    }}
                  >
                    Cancel Edit
                  </Button>
                )}
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
