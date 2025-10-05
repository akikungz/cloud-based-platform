import { Elysia } from "elysia";
import { cron } from "@elysiajs/cron";
import { logger } from "@momoi/libs/log";
import { db } from "@momoi/libs/db";

import { SemesterService } from "@momoi/core/v1/staff/semester/semester.service";

export const semester_cron = new Elysia({ name: "semester.cron" })
  .use(
    cron({
      name: "semester",
      // Run daily at midnight to check for semester transitions
      pattern: "0 0 * * *",
      run: async () => {
        try {
          logger.info("Running semester cron job - checking for semester transitions");

          const now = new Date();
          
          // Get the current active semester
          const activeSemester = await SemesterService.getActiveSemester();

          if (!activeSemester) {
            logger.warn("No active semester found");
            
            // Try to find and activate a semester that should be active now
            const allSemesters = await db.semester.findMany({
              where: { deleted_at: null },
              orderBy: { start_at: 'asc' }
            });

            const currentSemester = allSemesters.find(
              (semester) => semester.start_at <= now && semester.end_at >= now
            );

            if (currentSemester) {
              await SemesterService.activateSemester(currentSemester.id);
              logger.info(`Activated semester: ${currentSemester.name} (ID: ${currentSemester.id})`);
            } else {
              logger.warn("No semester found for current date range");
            }
            
            return;
          }

          // Check if the active semester has ended
          if (activeSemester.end_at < now) {
            logger.info(`Active semester "${activeSemester.name}" has ended. Checking for next semester...`);

            // Get the next semester
            const nextSemester = await SemesterService.getNextSemester();

            if (nextSemester && nextSemester.start_at <= now) {
              // Activate the next semester
              await SemesterService.activateSemester(nextSemester.id);
              logger.info(`Successfully activated next semester: ${nextSemester.name} (ID: ${nextSemester.id})`);
            } else if (nextSemester) {
              logger.info(`Next semester "${nextSemester.name}" found but not yet started (starts: ${nextSemester.start_at})`);
            } else {
              logger.warn("No next semester found to activate");
            }
          } else {
            logger.info(`Active semester "${activeSemester.name}" is still valid (ends: ${activeSemester.end_at})`);
          }
        } catch (error) {
          logger.error({ error }, "Error in semester cron job");
        }
      }
    })
  );