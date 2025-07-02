
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Investor, InvestorInput, InvestorStatus } from "@/types/investor";
import { Textarea } from "../ui/textarea";

interface AddInvestorModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: InvestorInput) => void;
}

const investorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  focus: z.string().min(1, "Focus area is required"),
  portfolio: z.coerce.number().int().positive("Portfolio must be a positive number"),
  stage: z.string().min(1, "Investment stage is required"),
  lastMeeting: z.string().default("Never"),
  status: z.string().min(1, "Status is required") as z.ZodType<InvestorStatus>,
  notes: z.string().optional(),
});

type InvestorFormValues = z.infer<typeof investorSchema>;

const AddInvestorModal: React.FC<AddInvestorModalProps> = ({ open, onClose, onSubmit }) => {
  const form = useForm<InvestorFormValues>({
    resolver: zodResolver(investorSchema),
    defaultValues: {
      name: "",
      focus: "",
      portfolio: 0,
      stage: "",
      lastMeeting: "Never",
      status: "to-contact",
      notes: "",
    }
  });

  function handleSubmit(data: InvestorFormValues) {
    // Ensure all required fields are present
    const investorData: InvestorInput = {
      name: data.name,
      focus: data.focus,
      portfolio: data.portfolio,
      stage: data.stage,
      lastMeeting: data.lastMeeting,
      status: data.status as InvestorStatus,
      notes: data.notes || "",
    };
    
    onSubmit(investorData);
    form.reset();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Investor</DialogTitle>
          <DialogDescription>
            Add details about a potential investor to track your fundraising efforts.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Investor Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Sequoia Capital" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="focus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Focus Area</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. B2B SaaS, Consumer Tech" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Investment Stage</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select investment stage" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Pre-seed, Seed">Pre-seed, Seed</SelectItem>
                        <SelectItem value="Series A">Series A</SelectItem>
                        <SelectItem value="Series A-B">Series A-B</SelectItem>
                        <SelectItem value="Series A-C">Series A-C</SelectItem>
                        <SelectItem value="Series B+">Series B+</SelectItem>
                        <SelectItem value="Growth">Growth</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="portfolio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Portfolio Size</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
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
                        <SelectItem value="to-contact">To Contact</SelectItem>
                        <SelectItem value="interested">Interested</SelectItem>
                        <SelectItem value="follow-up">Follow-up</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="committed">Committed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastMeeting"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Contact</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 2 weeks ago, Never" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Any additional notes about this investor..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end space-x-2 pt-2">
              <Button variant="outline" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Add Investor</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddInvestorModal;
