import Dashboard from "views/Dashboard";
import Candidates from "views/Candidates";
import Library from "views/library/Library";
import Question from "views/library/Question";
import Roles from "views/Roles";
import Skills from "views/Skills";
import Tests from "views/Test/Tests";
import CreateTest from "views/Test/CreateTest";
import Test from "views/Test/Test";
import Settings from "views/Test/Settings";
import Questions from "views/Test/Questions";
import TestCandidates from "views/Test/Candidates";
import QuestionsView from "views/library/Questions";
import SendInvites from "views/Test/SendInvites";
import TestResult from "views/Test/TestResult";
import AIQuestions from "views/library/AIQuestions";
import Users from "views/Users";

const dashboardRoutes = [
  {
    path: "/dashboard",
    name: "Dashboard",
    icon: "nc-icon nc-chart-pie-35",
    component: Dashboard,
    layout: "/admin"
  },
  {
    path: "/candidates",
    name: "Candidates",
    icon: "nc-icon nc-circle-09",
    component: Candidates,
    layout: "/admin"
  },
  {
    path: "/skills",
    name: "Skills",
    icon: "nc-icon nc-circle-09",
    component: Skills,
    layout: "/admin"
  },
  {
    path: "/roles",
    name: "Roles",
    icon: "nc-icon nc-circle-09",
    component: Roles,
    layout: "/admin"
  },
  {
    path: "/library",
    name: "Library",
    icon: "nc-icon nc-paper-2",
    component: Library,
    layout: "/admin",
    children: [
      {
        path: "/library",
        name: "Library",
        icon: "nc-icon nc-bookmark-2",
        component: Library,
        layout: "/admin"
      },
      {
        path: "/library/aiquestions",
        name: "AI Questions",
        icon: "nc-icon nc-bookmark-2",
        component: AIQuestions,
        layout: "/admin"
      },
      {
        path: "/library/addquestion",
        name: "Add Question",
        icon: "nc-icon nc-bookmark-2",
        component: Question,
        layout: "/admin"
      },
      {
        path: "/library/editquestion/:id",
        name: "Edit Question",
        icon: "nc-icon nc-bookmark-2",
        component: Question,
        layout: "/admin"
      },
      {
        path: "/library/questions",
        name: "Question",
        icon: "nc-icon nc-bookmark-2",
        component: QuestionsView,
        layout: "/admin"
      },
      {
        path: "/library/questions/:id",
        name: "Test",
        icon: "nc-icon nc-bookmark-2",
        component: QuestionsView,
        layout: "/admin"
      },
    ]
  },
  {
    path: "/tests",
    name: "Tests",
    icon: "nc-icon nc-notes",
    component: Tests,
    layout: "/admin",
    children: [
      {
        path: "/tests/create",
        name: "Create Test",
        icon: "nc-icon nc-bookmark-2",
        component: CreateTest,
        layout: "/admin"
      },
      {
        path: "/tests/:id",
        name: "Test",
        icon: "nc-icon nc-bookmark-2",
        component: Test,
        layout: "/admin"
      },
      {
        path: "/tests/settings",
        name: "Settings",
        icon: "nc-icon nc-bookmark-2",
        component: Settings,
        layout: "/admin"
      },
      {
        path: "/tests/questions",
        name: "Questions",
        icon: "nc-icon nc-bookmark-2",
        component: Questions,
        layout: "/admin"
      },
      {
        path: "/tests/candidates",
        name: "Candidates",
        icon: "nc-icon nc-bookmark-2",
        component: TestCandidates,
        layout: "/admin"
      },
      {
        path: "/tests/invites/:id",
        name: "Send Invite",
        icon: "nc-icon nc-bookmark-2",
        component: SendInvites,
        layout: "/admin"
      },
      {
        path: "/tests/invite/:id/result",
        name: "Test Result",
        icon: "nc-icon nc-bookmark-2",
        component: TestResult,
        layout: "/admin"
      }
    ]
  },
    {
    path: "/users",
    name: "Users",
    icon: "nc-icon nc-circle-09",
    component: Users,
    layout: "/admin"
  }
];

export default dashboardRoutes;