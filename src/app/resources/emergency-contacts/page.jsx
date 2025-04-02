"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Phone } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { resourceApi } from "@/lib/resourceApi";

export default function EmergencyContactsPage() {
  const { toast } = useToast();
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("all");

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    setIsLoading(true);
    try {
      const response = await resourceApi.public.getEmergencyContacts();
      if (!response?.resources) throw new Error("Invalid response format");
      setContacts(response.resources);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch emergency contacts",
        variant: "destructive",
      });
      setContacts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.contact?.phone?.includes(searchTerm) ||
      contact.contact?.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLevel =
      selectedLevel === "all" || contact.emergency_level === selectedLevel;

    return matchesSearch && matchesLevel;
  });

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Emergency Contacts</h1>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Search contacts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={selectedLevel} onValueChange={setSelectedLevel}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Emergency level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="high">High Priority</SelectItem>
            <SelectItem value="medium">Medium Priority</SelectItem>
            <SelectItem value="low">Low Priority</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading && !contacts.length ? (
        <div className="flex justify-center py-10">
          <p>Loading emergency contacts...</p>
        </div>
      ) : filteredContacts.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No emergency contacts found matching your criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContacts.map((contact) => (
            <Card
              key={contact.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    {contact.name}
                  </CardTitle>
                </div>
                <Badge
                  variant={
                    contact.emergency_level === "high"
                      ? "destructive"
                      : "secondary"
                  }
                >
                  {contact.emergency_level} priority
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="font-medium">
                    <p>Phone: {contact.contact.phone}</p>
                    {contact.contact.email && (
                      <p>Email: {contact.contact.email}</p>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Service Hours: {contact.metadata?.serviceHours || "N/A"}
                  </p>
                  {contact.tags && contact.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {contact.tags.map((tag, index) => (
                        <Badge key={index} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}