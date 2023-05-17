import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { SegmentedControl } from '@mantine/core';
import { useCalendar } from '../../hooks/useCalendar';

export default function CalendarHeader() {
  const {
    isToday,
    getTitle,
    availableViews,
    view,
    handlePrev,
    handleNext,
    selectToday,
    enableDayView,
    enable4DayView,
    enableWeekView,
  } = useCalendar();

  return (
    <div className="mb-2 flex flex-col justify-between gap-2 md:flex-row">
      <div className="flex items-center gap-4 text-3xl font-semibold">
        <span>{getTitle()}</span>
      </div>

      <div className="flex items-center justify-center gap-4 text-zinc-600 dark:text-zinc-300">
        <div className="flex h-full gap-0.5">
          <button
            className="h-full rounded-l-lg bg-zinc-500/10 p-2 text-3xl transition hover:bg-zinc-500/20 dark:bg-zinc-300/10 dark:hover:bg-zinc-300/20"
            onClick={handlePrev}
          >
            <ChevronLeftIcon className="w-4" />
          </button>

          <button
            onClick={isToday() ? undefined : selectToday}
            className={`px-4 py-1 font-semibold transition ${
              isToday()
                ? 'cursor-not-allowed bg-zinc-500/20 text-zinc-500 opacity-50 dark:bg-zinc-300/10 dark:text-zinc-300'
                : 'cursor-pointer bg-zinc-500/10 text-zinc-600 hover:bg-zinc-500/20 dark:bg-zinc-300/10 dark:text-zinc-300 dark:hover:bg-zinc-300/20'
            }`}
          >
            {view === 'day'
              ? 'Today'
              : view === 'week'
              ? 'This week'
              : 'Current'}
          </button>

          <button
            className="h-full rounded-r-lg bg-zinc-500/10 p-2 text-3xl transition hover:bg-zinc-500/20 dark:bg-zinc-300/10 dark:hover:bg-zinc-300/20"
            onClick={handleNext}
          >
            <ChevronRightIcon className="w-4" />
          </button>
        </div>

        <SegmentedControl
          radius="md"
          value={view}
          data={availableViews.filter((view) => view?.disabled !== true)}
          onChange={(value) => {
            if (value === 'day') enableDayView();
            if (value === '4-day') enable4DayView();
            if (value === 'week') enableWeekView();
          }}
        />
      </div>
    </div>
  );
}
