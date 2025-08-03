import * as DB from "db";

export class DrizzleAdapter {
  // Define the types for the schemas
  // Instance related schemas
  public instance = DB.instance.instance;
  public instance_course = DB.instance.instance_course;
  public instance_request = DB.instance.instance_request;
  public instance_request_extends = DB.instance.instance_request_extends;
  public instance_template = DB.instance.instance_template;
  // Notification related schemas
  public notification = DB.notification.notification;
  // Samester related schemas
  public samester = DB.samester;
  // User related schemas
  public user = DB.better_auth.user;
  public staff_list = DB.auth_schema.staff_list;

  constructor(public db: ReturnType<typeof DB.db>) {}
}
