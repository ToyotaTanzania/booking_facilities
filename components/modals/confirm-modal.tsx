"use client";

import { useId, useState } from "react";
import { CircleAlertIcon } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ConfirmModalProps {
  children: React.ReactNode;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmText?: string;
  itemToConfirm: string;
}

interface ControlledConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmText?: string;
  itemToConfirm: string;
}

export function ConfirmModal({
  children,
  onConfirm,
  title = "Final confirmation",
  description = "This action cannot be undone. To confirm, please enter",
  confirmText = "Delete",
  itemToConfirm,
}: ConfirmModalProps) {
  const id = useId();
  const [inputValue, setInputValue] = useState("");
  const [open, setOpen] = useState(false);

  const handleConfirm = () => {
    if (inputValue === itemToConfirm) {
      onConfirm();
      setOpen(false);
      setInputValue("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen);
      if (!newOpen) {
        setInputValue("");
      }
    }}>
      <DialogTrigger asChild onClick={(e) => {
        e.stopPropagation();
        setOpen(true);
      }}>
        {children}
      </DialogTrigger>
      <DialogContent>
        <div className="flex flex-col items-center gap-2">
          <div
            className="flex size-9 shrink-0 items-center justify-center rounded-full border border-destructive"
            aria-hidden="true"
          >
            <CircleAlertIcon className="text-destructive" size={16} />
          </div>
          <DialogHeader>
            <DialogTitle className="text-center">
              {title}
            </DialogTitle>
            <DialogDescription className="text-center">
              {description}{" "}
              <span className="font-medium text-foreground">{itemToConfirm}</span>
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-4 py-3">
          <div className="space-y-2">
            <Label htmlFor={id}>Confirmation text</Label>
            <Input
              id={id}
              type="text"
              placeholder={`Type ${itemToConfirm} to confirm`}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <div className="flex w-full gap-2">
            <DialogClose asChild>
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  setInputValue("");
                  setOpen(false);
                }}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="destructive"
              className="flex-1"
              disabled={inputValue !== itemToConfirm}
              onClick={handleConfirm}
            >
              {confirmText}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ControlledConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Final confirmation",
  description = "This action cannot be undone. To confirm, please enter",
  confirmText = "Delete",
  itemToConfirm,
}: ControlledConfirmModalProps) {
  const id = useId();
  const [inputValue, setInputValue] = useState("");

  const handleConfirm = () => {
    if (inputValue === itemToConfirm) {
      onConfirm();
      setInputValue("");
    }
  };

  const handleClose = () => {
    setInputValue("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(newOpen) => {
      if (!newOpen) {
        handleClose();
      }
    }}>
      <DialogContent>
        <div className="flex flex-col items-center gap-2">
          <div
            className="flex size-9 shrink-0 items-center justify-center rounded-full border border-destructive"
            aria-hidden="true"
          >
            <CircleAlertIcon className="text-destructive" size={16} />
          </div>
          <DialogHeader>
            <DialogTitle className="text-center">
              {title}
            </DialogTitle>
            <DialogDescription className="text-center">
              {description}{" "}
              <span className="font-medium text-foreground">{itemToConfirm}</span>
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-4 py-3">
          <div className="space-y-2">
            <Label htmlFor={id}>Confirmation text</Label>
            <Input
              id={id}
              type="text"
              placeholder={`Type ${itemToConfirm} to confirm`}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <div className="flex w-full gap-2">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="flex-1"
              disabled={inputValue !== itemToConfirm}
              onClick={handleConfirm}
            >
              {confirmText}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}