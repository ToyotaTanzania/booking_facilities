import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function Content() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Only Content</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Please login again.</SheetTitle>
        </SheetHeader>
        <p className="px-4 text-muted-foreground">
          Your session has expired. Please login again to continue using the
          application.
        </p>
        <SheetFooter>
          <SheetClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </SheetClose>
          <Button type="submit">Login</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
