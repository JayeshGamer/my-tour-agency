import { db } from "@/lib/db";
import { tours, bookings } from "@/lib/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import Link from "next/link";
import { Plus, Edit, Trash2, Eye, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TourDeleteButton from "@/components/admin/TourDeleteButton";

async function getToursData(searchQuery?: string, status?: string) {
  let query = db
    .select({
      id: tours.id,
      name: tours.name,
      location: tours.location,
      price: tours.price,
      duration: tours.duration,
      status: tours.status,
      featured: tours.featured,
      maxGroupSize: tours.maxGroupSize,
      createdAt: tours.createdAt,
      bookingCount: sql<number>`(SELECT COUNT(*) FROM ${bookings} WHERE tour_id = ${tours.id})`,
    })
    .from(tours);

  // Apply search filter
  if (searchQuery) {
    query = query.where(
      sql`${tours.name} ILIKE ${'%' + searchQuery + '%'} OR ${tours.location} ILIKE ${'%' + searchQuery + '%'}`
    );
  }
  
  // Apply status filter if both search and status are provided
  if (searchQuery && status && status !== 'all') {
    query = query.where(
      sql`(${tours.name} ILIKE ${'%' + searchQuery + '%'} OR ${tours.location} ILIKE ${'%' + searchQuery + '%'}) AND ${tours.status} = ${status}`
    );
  } else if (status && status !== 'all') {
    // Apply only status filter
    query = query.where(eq(tours.status, status as 'Active' | 'Inactive'));
  }

  const toursData = await query.orderBy(desc(tours.createdAt));

  return toursData;
}

export default async function ToursPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const params = await searchParams;
  const toursData = await getToursData(params.q, params.status);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tours Management</h1>
          <p className="text-gray-500 mt-1">Manage your tour packages and offerings</p>
        </div>
        <Button asChild>
          <Link href="/admin/tours/new">
            <Plus className="h-4 w-4 mr-2" />
            Create Tour
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <form method="GET" className="flex gap-4">
            <div className="flex-1">
              <Input
                name="q"
                placeholder="Search tours by name or location..."
                defaultValue={params.q}
                className="w-full"
              />
            </div>
            <Select name="status" defaultValue={params.status || 'all'}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" variant="secondary">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Tours Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Tours ({toursData.length})</CardTitle>
          <CardDescription>
            Manage your tour packages, pricing, and availability
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tour Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Group Size</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {toursData.length > 0 ? (
                toursData.map((tour) => (
                  <TableRow key={tour.id}>
                    <TableCell className="font-medium">{tour.name}</TableCell>
                    <TableCell>{tour.location}</TableCell>
                    <TableCell>${parseFloat(tour.price).toLocaleString()}</TableCell>
                    <TableCell>{tour.duration} days</TableCell>
                    <TableCell>{tour.maxGroupSize} max</TableCell>
                    <TableCell>
                      <Badge
                        variant={tour.status === 'Active' ? 'default' : 'secondary'}
                      >
                        {tour.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {tour.featured && (
                        <Badge variant="outline" className="bg-yellow-50">
                          Featured
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/tours/${tour.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/admin/tours/${tour.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <TourDeleteButton tourId={tour.id} tourName={tour.name} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10 text-gray-500">
                    No tours found. Create your first tour to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
