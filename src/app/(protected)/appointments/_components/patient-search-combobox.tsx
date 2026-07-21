"use client";

import { CheckIcon, ChevronsUpDownIcon, PlusIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useState } from "react";

import { searchPatients } from "@/actions/search-patients";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type PatientSearchOption = {
  id: string;
  name: string;
  email?: string;
  phoneNumber?: string;
};

interface PatientSearchComboboxProps {
  value: string;
  selectedLabel?: string;
  onSelect: (patient: PatientSearchOption) => void;
  onCreatePatient: () => void;
  disabled?: boolean;
}

export function PatientSearchCombobox({
  value,
  selectedLabel,
  onSelect,
  onCreatePatient,
  disabled,
}: PatientSearchComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<PatientSearchOption[]>([]);

  const searchAction = useAction(searchPatients, {
    onSuccess: ({ data }) => {
      setOptions(data?.patients ?? []);
    },
    onError: () => {
      setOptions([]);
    },
  });

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      searchAction.execute({ query, limit: 20 });
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- execute identity muda; debounce por query/open
  }, [query, open]);

  const emptyState = !searchAction.isExecuting && options.length === 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between font-normal"
        >
          <span className="truncate">
            {selectedLabel || "Buscar paciente…"}
          </span>
          <ChevronsUpDownIcon className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Digite o nome do paciente…"
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            {searchAction.isExecuting && (
              <div className="text-muted-foreground p-2 text-center text-sm">
                Buscando…
              </div>
            )}
            {emptyState && (
              <CommandEmpty className="p-2">
                <p className="text-muted-foreground mb-2 text-sm">
                  {query.trim()
                    ? "Nenhum paciente encontrado."
                    : "Nenhum paciente cadastrado."}
                </p>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setOpen(false);
                    onCreatePatient();
                  }}
                >
                  <PlusIcon className="mr-2 size-4" />
                  Cadastrar paciente
                </Button>
              </CommandEmpty>
            )}
            <CommandGroup>
              {options.map((patient) => (
                <CommandItem
                  key={patient.id}
                  value={patient.id}
                  onSelect={() => {
                    onSelect(patient);
                    setOpen(false);
                    setQuery("");
                  }}
                >
                  <CheckIcon
                    className={cn(
                      "mr-2 size-4",
                      value === patient.id ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate">{patient.name}</span>
                    <span className="text-muted-foreground truncate text-xs">
                      {patient.phoneNumber}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
