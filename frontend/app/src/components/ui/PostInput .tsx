import { useState } from "react";
import Card from '@components/ui/Card'
import Icon from '@components/ui/Icon'

const PostInput = () => {
  const [value, setValue] = useState("");

  const handleSubmit = () => {
    console.log(value); // later → API call
    setValue(""); // clear after submit
  };

  return (
    <Card variant="surface-low">
      <div className="flex items-start gap-4">

        {/* Icon */}
        <div className="w-10 h-10 rounded-full bg-primary-500/10 dark:bg-primary-500/20 flex items-center justify-center flex-shrink-0">
          <Icon name="edit" size="sm" className="text-primary-600 dark:text-primary-400" />
        </div>

        {/* TEXTAREA WITH ENHANCEMENTS */}
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Share something with the community…"
          rows={2}

          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = "auto";
            target.style.height = target.scrollHeight + "px";
          }}

          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}

          className="
            flex-1 px-4 py-3 rounded-xl text-sm border resize-none outline-none
            bg-slate-50 border-slate-200 text-on-surface-variant
            focus:border-primary-400 focus:bg-white
            hover:border-primary-300 hover:text-on-surface
            transition-all

            dark:bg-white/5 dark:border-white/[0.08] dark:text-white/60
            dark:focus:border-primary-400/40 dark:focus:bg-white/10
          "
        />

        {/* POST BUTTON */}
        <button
          onClick={handleSubmit}
          disabled={!value.trim()}
          className="px-4 py-2 bg-primary-500 text-white rounded-lg disabled:opacity-50"
        >
          Post
        </button>

      </div>
    </Card>
  );
};

export default PostInput;