import { db } from "@/lib/db";
import { tours, bookings } from "@/lib/db/schema";
import { desc, eq, sql, and } from "drizzle-orm";
import Link from "next/link";
import { Plus, Edit, Eye, Search, Package, TrendingUp, Star, MapPin } from "lucide-react";
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
  try {
    // Build where conditions first
    const conditions = [];
    
    if (searchQuery) {
      conditions.push(
        sql`${tours.name} ILIKE ${'%' + searchQuery + '%'} OR ${tours.location} ILIKE ${'%' + searchQuery + '%'}`
      );
    }
    
    if (status && status !== 'all') {
      conditions.push(eq(tours.status, status as 'Active' | 'Inactive'));
    }

    // Build and execute query based on whether we have conditions
    let toursData;
    
    if (conditions.length > 0) {
      toursData = await db
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
        .from(tours)
        .where(and(...conditions))
        .orderBy(desc(tours.createdAt));
    } else {
      toursData = await db
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
        .from(tours)
        .orderBy(desc(tours.createdAt));
    }
    
    // Calculate stats
    const totalTours = toursData.length;
    const activeTours = toursData.filter(t => t.status === 'Active').length;
    const featuredTours = toursData.filter(t => t.featured).length;
    const totalBookings = toursData.reduce((sum, t) => sum + (Number(t.bookingCount) || 0), 0);

    return {
      tours: toursData,
      stats: {
        total: totalTours,
        active: activeTours,
        featured: featuredTours,
        bookings: totalBookings
      }
    };
  } catch (error) {
    console.error('Error fetching tours:', error);
    return {
      tours: [],
      stats: { total: 0, active: 0, featured: 0, bookings: 0 }
    };
  }
}

export default async function ToursPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const params = await searchParams;
  const data = await getToursData(params.q, params.status);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-foreground">
                Tours Management
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage your tour packages and offerings
              </p>
            </div>
          </div>
          <Button asChild size="lg" className="shadow-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
            <Link href="/admin/tours/new">
              <Plus className="h-4 w-4 mr-2" />
              Create Tour
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden border-border/50 bg-card hover:shadow-lg transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Total Tours</p>
                <p className="text-3xl font-bold text-foreground">{data.stats.total}</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/10 ring-1 ring-blue-500/20">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-border/50 bg-card hover:shadow-lg transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Active Tours</p>
                <p className="text-3xl font-bold text-green-600">{data.stats.active}</p>
              </div>
              <div className="p-3 rounded-xl bg-green-500/10 ring-1 ring-green-500/20">
                <MapPin className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-border/50 bg-card hover:shadow-lg transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-500/10 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Featured Tours</p>
                <p className="text-3xl font-bold text-yellow-600">{data.stats.featured}</p>
              </div>
              <div className="p-3 rounded-xl bg-yellow-500/10 ring-1 ring-yellow-500/20">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-border/50 bg-card hover:shadow-lg transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Total Bookings</p>
                <p className="text-3xl font-bold text-purple-600">{data.stats.bookings}</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-500/10 ring-1 ring-purple-500/20">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters Card */}
      <Card className="border-border/50 shadow-md">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">Search & Filter</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <form method="GET" className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  name="q"
                  placeholder="Search tours by name or location..."
                  defaultValue={params.q}
                  className="pl-10 h-11"
                />
              </div>
            </div>
            <Select name="status" defaultValue={params.status || 'all'}>
              <SelectTrigger className="w-full sm:w-48 h-11">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" variant="secondary" className="h-11 px-6">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Tours Table Card */}
      <Card className="border-border/50 shadow-md">
        <CardHeader className="border-b bg-muted/30">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">All Tours</CardTitle>
              <CardDescription className="mt-1.5">
                {data.tours.length} {data.tours.length === 1 ? 'tour' : 'tours'} found
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-base px-3 py-1.5">
              Total: {data.tours.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="font-semibold">Tour Name</TableHead>
                  <TableHead className="font-semibold">Location</TableHead>
                  <TableHead className="font-semibold">Price</TableHead>
                  <TableHead className="font-semibold">Duration</TableHead>
                  <TableHead className="font-semibold">Group Size</TableHead>
                  <TableHead className="font-semibold">Bookings</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Featured</TableHead>
                  <TableHead className="text-right font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.tours.length > 0 ? (
                  data.tours.map((tour) => (
                    <TableRow key={tour.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium">{tour.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {tour.location}
                      </TableCell>
                      <TableCell className="font-semibold">
                        ₹{parseFloat(tour.price).toLocaleString('en-IN')}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {tour.duration} {tour.duration === 1 ? 'day' : 'days'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {tour.maxGroupSize} max
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-medium">
                          {tour.bookingCount || 0}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={tour.status === 'Active' ? 'default' : 'secondary'}
                          className="font-medium"
                        >
                          {tour.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {tour.featured ? (
                          <Badge variant="outline" className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400 font-medium">
                            ⭐ Featured
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            className="hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400"
                          >
                            <Link href={`/tours/${tour.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            className="hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400"
                          >
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
                    <TableCell colSpan={9} className="text-center py-12">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                          <Search className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-semibold text-foreground">
                            No tours found
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {params.q || params.status ?
                              'Try adjusting your search filters' :
                              'Create your first tour to get started'
                            }
                          </p>
                        </div>
                        {!params.q && !params.status && (
                          <Button asChild className="mt-2">
                            <Link href="/admin/tours/new">
                              <Plus className="h-4 w-4 mr-2" />
                              Create First Tour
                            </Link>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
