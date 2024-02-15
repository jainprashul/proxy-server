import cron from "node-cron"
import { compile } from "../helpers/helpers";

console.log("Cron job started");
cron.schedule("0 */1 * * *", async (x) => {
  await compile();
}, {
  timezone: "Asia/Kolkata"
});