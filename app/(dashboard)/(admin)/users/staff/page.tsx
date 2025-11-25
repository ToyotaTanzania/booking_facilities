"use client";

import { useState } from "react";
import { Search, User, MapPin, Phone, Mail, Building, Users, Shield } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { api } from "@/trpc/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function StaffDirectoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");

  const { data: users, isLoading } = api.user.list.useQuery({
    status: "active", // Only show active users
    search: searchQuery || undefined,
  });

  // Get unique departments for filtering
  const departments = Array.from(
    new Set(
      users
        ?.filter(user => user.department)
        .map(user => user.department)
        .filter(Boolean) || []
    )
  ).sort();

  // Filter users by department if selected
  const filteredUsers = users?.filter(user => {
    if (departmentFilter === "all") return true;
    return user.department === departmentFilter;
  }) || [];

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'user':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <Heading
            title="Staff Directory"
            description="Browse and contact active staff members"
          />
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {filteredUsers.length} active staff members
            </span>
          </div>
        </div>
        <Separator />

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search staff members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                      <div className="h-3 bg-gray-200 rounded w-48"></div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <Card key={user.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={user.avatar_url || undefined} />
                        <AvatarFallback className="text-lg">
                          {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{user.name || 'No Name'}</CardTitle>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            <span>{user.email}</span>
                          </div>
                          {user.department && (
                            <div className="flex items-center gap-1">
                              <Building className="h-4 w-4" />
                              <span>{user.department}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getRoleColor(user.role)}>
                        {user.role}
                      </Badge>
                      {user.phone && (
                        <Button variant="outline" size="sm" className="gap-2">
                          <Phone className="h-4 w-4" />
                          Contact
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Contact Information */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Contact Information</h4>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        {user.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            <span>{user.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          <span>{user.email}</span>
                        </div>
                        {user.department && (
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            <span>{user.department}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Profile Information */}
                    {user.user_profiles && user.user_profiles.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Profile</h4>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          {user.user_profiles[0].unit && (
                            <div className="flex items-center gap-2">
                              <Building className="h-4 w-4" />
                              <span>Unit: {user.user_profiles[0].unit}</span>
                            </div>
                          )}
                          {user.user_profiles[0].segment && (
                            <div className="flex items-center gap-2">
                              <Building className="h-4 w-4" />
                              <span>Segment: {user.user_profiles[0].segment}</span>
                            </div>
                          )}
                          {user.user_profiles[0].division && (
                            <div className="flex items-center gap-2">
                              <Building className="h-4 w-4" />
                              <span>Division: {user.user_profiles[0].division}</span>
                            </div>
                          )}
                          {user.user_profiles[0].legal_entity && (
                            <div className="flex items-center gap-2">
                              <Building className="h-4 w-4" />
                              <span>Legal Entity: {user.user_profiles[0].legal_entity}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>Active: {user.user_profiles[0].isActive ? 'Yes' : 'No'}</span>
                          </div>
                          {user.user_profiles[0].role && (
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4" />
                              <span>Role: {user.user_profiles[0].role}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredUsers.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              No staff members found
            </h3>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
