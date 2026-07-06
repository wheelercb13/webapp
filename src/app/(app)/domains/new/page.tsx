import { createDomain } from "../actions";
import { DomainForm } from "../domain-form";

export default function NewDomainPage() {
  return (
    <div className="mx-auto flex w-full max-w-[468px] flex-col px-[22px]">
      <div className="pb-[26px] pt-9">
        <h1 className="font-serif text-[34px] font-medium leading-[1.02] tracking-[-0.01em] text-foreground-display">
          Create Domain
        </h1>
      </div>
      <div className="rounded-xl border border-card-border p-4">
        <DomainForm action={createDomain} submitLabel="Add Domain" />
      </div>
    </div>
  );
}
