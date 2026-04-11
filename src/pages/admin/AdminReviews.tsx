import { useState } from 'react';
import { Star, Check, X, Trash2, MessageSquare, Plus, Edit } from 'lucide-react';
import { useAllReviews, useApproveReview, useDeleteReview, useUpdateReview, useCreateAdminReview } from '@/hooks/useProductReviews';
import { useProducts } from '@/hooks/useShopData';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export default function AdminReviews() {
  const { data: reviews = [], isLoading } = useAllReviews(false);
  const { data: products = [] } = useProducts();
  const approveReview = useApproveReview();
  const deleteReview = useDeleteReview();
  const updateReview = useUpdateReview();
  const createReview = useCreateAdminReview();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    rating: 5,
    text: '',
    product_id: 'none',
    is_approved: true,
  });

  const filteredReviews = reviews.filter((review) => {
    if (filter === 'pending') return !review.is_approved;
    if (filter === 'approved') return review.is_approved;
    return true;
  });

  const pendingCount = reviews.filter((r) => !r.is_approved).length;

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteReview.mutateAsync(deleteId);
    setDeleteId(null);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleAddReview = () => {
    setFormData({
      name: '',
      rating: 5,
      text: '',
      product_id: 'none',
      is_approved: true,
    });
    setEditingReview(null);
    setIsAddDialogOpen(true);
  };

  const handleEditReview = (review: any) => {
    setFormData({
      name: review.name,
      rating: review.rating,
      text: review.text,
      product_id: review.product_id ?? 'none',
      is_approved: review.is_approved,
    });
    setEditingReview(review);
    setIsAddDialogOpen(true);
  };

  const handleSubmitReview = async () => {
    if (!formData.name.trim() || !formData.text.trim()) {
      return;
    }

    try {
      if (editingReview) {
        await updateReview.mutateAsync({
          id: editingReview.id,
          name: formData.name,
          rating: formData.rating,
          text: formData.text,
          is_approved: formData.is_approved,
          verified_purchase: formData.verified_purchase,
        });
      } else {
        await createReview.mutateAsync({
          product_id: formData.product_id !== 'none' ? formData.product_id : undefined,
          name: formData.name,
          rating: formData.rating,
          text: formData.text,
          is_approved: formData.is_approved,
        });
      }
      setIsAddDialogOpen(false);
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Reviews</h1>
          {pendingCount > 0 && (
            <p className="text-sm text-muted-foreground">
              {pendingCount} review{pendingCount !== 1 ? 's' : ''} pending approval
            </p>
          )}
        </div>
        <Button onClick={handleAddReview} className="btn-accent">
          <Plus className="h-4 w-4 mr-2" />
          Add Review
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {(['all', 'pending', 'approved'] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(f)}
            className={filter === f ? 'btn-accent' : ''}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f === 'pending' && pendingCount > 0 && (
              <span className="ml-2 bg-destructive text-destructive-foreground text-xs px-1.5 py-0.5 rounded-full">
                {pendingCount}
              </span>
            )}
          </Button>
        ))}
      </div>

      {/* Reviews List */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto" />
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No reviews found</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredReviews.map((review) => (
              <div key={review.id} className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-medium">{review.name}</span>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={cn(
                              "h-4 w-4",
                              star <= review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted"
                            )}
                          />
                        ))}
                      </div>
                      <span
                        className={cn(
                          "text-xs px-2 py-0.5 rounded-full",
                          review.is_approved
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        )}
                      >
                        {review.is_approved ? 'Approved' : 'Pending'}
                      </span>
                    </div>
                    <p className="text-muted-foreground mb-2">{review.text}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(review.created_at)}</p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditReview(review)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    {!review.is_approved ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 hover:bg-green-50"
                        onClick={() => approveReview.mutate({ id: review.id, approved: true })}
                        disabled={approveReview.isPending}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => approveReview.mutate({ id: review.id, approved: false })}
                        disabled={approveReview.isPending}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Unapprove
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => setDeleteId(review.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Review</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this review? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add/Edit Review Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingReview ? 'Edit Review' : 'Add New Review'}</DialogTitle>
            <DialogDescription>
              {editingReview ? 'Update the review details below.' : 'Create a new review for your store.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Reviewer Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter reviewer name"
              />
            </div>

            <div>
              <Label htmlFor="product">Product (Optional)</Label>
              <Select
                value={formData.product_id}
                onValueChange={(value) => setFormData({ ...formData, product_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No product selected</SelectItem>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Rating *</Label>
              <div className="flex gap-1 mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: star })}
                    className="p-1 transition-colors"
                  >
                    <Star
                      className={cn(
                        "h-6 w-6 transition-colors",
                        formData.rating >= star
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground"
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="text">Review Text *</Label>
              <Textarea
                id="text"
                value={formData.text}
                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                placeholder="Enter review text"
                rows={4}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_approved"
                checked={formData.is_approved}
                onChange={(e) => setFormData({ ...formData, is_approved: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="is_approved">Approved</Label>
            </div>

          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitReview}
              disabled={createReview.isPending || updateReview.isPending || !formData.name.trim() || !formData.text.trim()}
              className="btn-accent"
            >
              {createReview.isPending || updateReview.isPending ? 'Saving...' : editingReview ? 'Update Review' : 'Create Review'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
