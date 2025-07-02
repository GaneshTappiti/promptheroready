
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FundingRound, FundingRoundInput } from "@/types/investor";

interface AddFundingRoundModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: FundingRoundInput) => void;
}

const fundingRoundSchema = z.object({
  name: z.string().min(1, "Name is required"),
  target: z.string().min(1, "Target amount is required"),
  raised: z.string().default("$0"),
  progress: z.coerce.number().min(0).max(100).default(0),
  investors: z.coerce.number().int().min(0).default(0),
  status: z.enum(["active", "planned", "completed"]).default("planned"),
  timeline: z.string().optional(),
});

type FundingRoundFormValues = z.infer<typeof fundingRoundSchema>;

const AddFundingRoundModal: React.FC<AddFundingRoundModalProps> = ({ 
  open, 
  onClose, 
  onSubmit 
}) => {
  const form = useForm<FundingRoundFormValues>({
    resolver: zodResolver(fundingRoundSchema),
    defaultValues: {
      name: "",
      target: "",
      raised: "$0",
      progress: 0,
      investors: 0,
      status: "planned",
      timeline: "3 months",
    }
  });

  function handleSubmit(data: FundingRoundFormValues) {
    // Ensure all required fields are present
    const roundData: FundingRoundInput = {
      name: data.name,
      target: data.target,
      raised: data.raised,
      progress: data.progress,
      investors: data.investors,
      status: data.status,
      timeline: data.timeline,
    };
    
    onSubmit(roundData);
    form.reset();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Funding Round</DialogTitle>
          <DialogDescription>
            Set up a new funding round to track fundraising progress.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Round Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Seed Round, Series A" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="target"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Amount</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. $500K, $2M" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="planned">Planned</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="timeline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Timeline</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 3 months, 6 months" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end space-x-2 pt-2">
              <Button variant="outline" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Create Round</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddFundingRoundModal;
