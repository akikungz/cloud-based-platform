import { Elysia } from "elysia";

import { Role } from "auth/utils/role";

export const mockAuthStaff = new Elysia({
  name: "mock.auth.staff.service"
})
  .macro({
    auth: {
      resolve: async () => {
        return {
          user: {
            id: "test-staff-id",
            email: "staff.t@itm.kmutnb.ac.th",
            role: Role.Staff,
            image: null
          },
          session: {
            id: "session-id",
            userId: "test-staff-id",
            expiresAt: new Date(new Date().getTime() + 60 * 60 * 1000) // 1 hour from now
          },
          isStaff: true
        }
      }
    }
  });

export const mockAuthStudent = new Elysia({
  name: "mock.auth.student.service"
})
  .macro({
    auth: {
      resolve: async () => {
        return {
          user: {
            id: "test-student-id",
            email: "s6506022620036@email.kmutnb.ac.th",
            role: Role.Student,
            image: null
          },
          session: {
            id: "session-id",
            userId: "test-student-id",
            expiresAt: new Date(new Date().getTime() + 60 * 60 * 1000) // 1 hour from now
          },
          isStaff: false
        }
      }
    }
  });

export const mockAuthNoUser = new Elysia({
  name: "mock.auth.nouser.service"
})
  .macro({
    auth: {
      resolve: async ({ status }) => {
        return status(401, { message: "Unauthorized" })
      }
    }
  });