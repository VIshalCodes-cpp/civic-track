import { useComplaints } from '@/context/ComplaintContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Profile() {
  const { user } = useComplaints();

  if (!user) {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <h1 className="text-3xl font-bold tracking-tight text-primary mb-6">
          Profile
        </h1>
        <p>You must be logged in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold tracking-tight text-primary mb-6">
        My Profile
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Your Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.profileImage} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-semibold">{user.name}</h2>
              <p className="text-muted-foreground">{user.role}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={user.name} disabled />
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" value={user.email} disabled />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" value={user.phone} disabled />
            </div>
            {user.department && (
              <div>
                <Label htmlFor="department">Department</Label>
                <Input id="department" value={user.department} disabled />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
