// src/router/index.jsx
import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import HomePage from "../pages/HomePage";
import Login from "../pages/Auth/Login";
import SetupPassword from "../pages/Auth/SetupPassword";
import PrivateRoute from "./PrivateRoute";
import AdminLayout from "../layouts/AdminLayout";
import ParentDashboard from "../pages/Parent/ParentDashboard/ParentDashboard";
import ParentLayout from "../layouts/ParentLayout";
import DiseaseRecordManagement from "../pages/Admin&Nurse/DiseaseManagement/DiseaseRecordManagement";
import SpecialistExamManagement from "../pages/Admin/SpecialistExam/SpecialistExamManagement";
import SendDrugForm from "../pages/Parent/SendDrug/SendDrugForm";
import DrugTable from "../pages/Parent/SendDrug/DrugTable";
import StudentRegularCheckup from "../pages/Parent/RegularCheckup/StudentRegularCheckup";
import RegularCheckupSurvey from "../pages/Parent/RegularCheckup/RegularCheckupSurvey";
import VaccineCampaignSurvey from "../pages/Parent/VaccineCampaign/VaccineCampaignSurvey";
import HealthRecord from "../pages/Parent/DailyHealth/HealthRecord";
import StudentProfile from "../pages/Parent/StudentProfile/StudentProfile";
import NewVaccineCampaign from "../pages/Admin/VaccineCampaign/NewVaccineCampaign";
import VaccineCampaignDetails from "../pages/Admin/VaccineCampaign/VaccineCampaignDetails";
import VaccineCampaignManagement from "../pages/Admin/VaccineCampaign/VaccineCampaignManagement";
import VaccineStudentList from "../pages/Admin/VaccineCampaign/VaccineStudentList";
import AdminDashboard from "../pages/Admin/AdminDashboard/AdminDashboard";
import UserManagement from "../pages/Admin/UserManagement/UserManagement";
import CreateUserPage from "../pages/Admin/UserManagement/CreateUserPage";
import EditUserPage from "../pages/Admin/UserManagement/EditUserPage";
import CompletedRegularCheckupReport from "../pages/Admin&Nurse/CompletedRegularCheckupReport/CompletedRegularCheckupReport";
import CompletedVaccineReport from "../pages/Admin&Nurse/CompletedVaccineReport/CompletedVaccineReport";
import DailyHealthRecord from "../pages/Admin&Nurse/DailyHealthManagement/DailyHealthRecord";
import AddRecordPage from "../pages/Admin&Nurse/DailyHealthManagement/AddRecordPage";
import RegularCheckup from "../pages/Admin&Nurse/RegularCheckupManagement/RegularCheckup";
import RegularCheckupDetails from "../pages/Admin&Nurse/RegularCheckupManagement/RegularCheckupDetails";
import RegularCheckupRegisterList from "../pages/Admin&Nurse/RegularCheckupManagement/RegularCheckupRegisterList";
import VaccineManagement from "../pages/Admin&Nurse/VaccineManagement/VaccineManagement";
import SendDrugManagement from "../pages/Admin&Nurse/SendDrugManagement/SendDrugManagement";
import RegularCheckupReport from "../pages/Nurse/RegularCheckupReport/RegularCheckupReport";
import VaccineCampaignReport from "../pages/Nurse/VaccineCampaignReport/VaccineCampaignReport";
import AuthFlow from "../pages/Auth/ForgotPassword/AuthFlow";
import RegularCheckupCampaignForm from "../pages/Admin&Nurse/RegularCheckupManagement/RegularCheckupCampaignForm";
import VaccineCampaignInfo from "../pages/Parent/VaccineCampaign/VaccineCampaignInfo";
import VaccineDeclarationForm from "../pages/Parent/Declare/VaccineDeclarationForm";
import DiseaseDeclarationForm from "../pages/Parent/Declare/DiseaseDeclarationForm";
import BlogList from "../pages/Blogs/BlogList";
import BlogEditor from "../pages/Blogs/BlogEditor";
import ShowBlog from "../pages/Blogs/ShowBlog";
import HealthRecordList from "../pages/Parent/HealthRecord/HealthRecordList";
import HealthDeclarationHistory from "../pages/Parent/Declare/HealthDeclarationHistory";
import DeclarationManagement from "../pages/Admin&Nurse/HealthDeclarationManagement/DeclarationManagement";
import HealthDashboard from "../pages/Parent/RegularCheckup/HealthDashboard";
import CheckupHistoryInfo from "../pages/Parent/RegularCheckup/CheckupHistoryInfo";
import ParentCheckupLayout from "../pages/Parent/RegularCheckup/ParentCheckupLayout";
import StudentOverview from "../pages/Student/StudentOverview";
import UpdateVaccineCampaign from "../pages/Admin/VaccineCampaign/UpdateVaccineCampaign";
import VaccineForStudentEligible from "../pages/Admin&Nurse/VaccineManagement/VaccineForStudentEligible";
import Profile from "../pages/Profile/Profile";
import AboutSchoolMedix from "../pages/Admin/AboutSchoolMedix/AboutSchoolMedix";
import ParentSchedule from "../pages/Parent/ParentDashboard/ParentSchedule";
import UserSettings from "../pages/UserSettings/UserSettings";
import ResetPassword from "../pages/Auth/ResetPassword";
import ParentEditStudentProfile from "../pages/Parent/StudentProfile/ParentEditStudentProfile";
import DetailHealthRecord from "../pages/Parent/DailyHealth/DetailHealthRecord";
import DetailHealthRecordForUpdate from "../pages/Admin&Nurse/DailyHealthManagement/DetailHealthRecordForUpdate";
import VaccinationHistoryDetail from "../pages/Parent/VaccinationRecord/VaccinationHistoryDetail";
import MedicalSupplyManagement from "../pages/Admin/MedicalSupplyManagement/MedicalSupplyManagement";
import MedicalItemsList from "../pages/Admin/MedicalSupplyManagement/MedicalItemsList";
import AddMedicationForm from "../pages/Parent/VaccineCampaign/AddMedicationForm";
import AddMedicalSupplyForm from "../pages/Admin/MedicalSupplyManagement/AddMedicalSupplyForm";

const routes = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "setup-password",
        element: <SetupPassword />,
      },
      {
        path: "forgot-password",
        element: <AuthFlow />,
      },
      {
        path: "reset-password",
        element: <ResetPassword />,
      },

      {
        path: "/blog",
        element: <BlogList />,
      },
      {
        path: "/blog/edit/:id",
        element: <BlogEditor />,
      },
      {
        path: "/blog/edit",
        element: <BlogEditor />,
      },
      {
        path: "/blog/:id",
        element: <ShowBlog />,
      },
      {
        path: "/profile",
        element: <Profile />,
      },
      {
        path: "/settings",
        element: <UserSettings />,
      },
      {
        path: "/about",
        element: <AboutSchoolMedix />,
      },
    ],
  },
  {
    path: "/admin",
    element: <PrivateRoute allowedRoles={"admin"} />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          {
            path: "",
            element: <AdminDashboard />,
          },
          {
            path: "send-drug",
            element: <SendDrugManagement />,
          },
          {
            path: "user-manage",
            element: <UserManagement />,
          },
          {
            path: "medical-supply",
            element: <MedicalItemsList />,
          },
          {
            path: "medicine-item-form",
            element: <AddMedicationForm />,
          },
          {
            path: "medicine-item-form/:id",
            element: <AddMedicationForm />,
          },
          {
            path: "medical-supply-item-form",
            element: <AddMedicalSupplyForm />,
          },

          {
            path: "medical-supply-item-form/:id",
            element: <AddMedicalSupplyForm />,
          },

          {
            path: "vaccine-campaign",
            element: <VaccineCampaignManagement />,
          },
          {
            path: "daily-health",
            element: <DailyHealthRecord />,
          },
          {
            path: "daily-health/:record_id",
            element: <DetailHealthRecordForUpdate />
          },
          {
            path: "vaccine-campaign-creation",
            element: <NewVaccineCampaign />,
          },
          {
            path: "add-record",
            element: <AddRecordPage />,
          },
          {
            path: "vaccine-campaign/:id",
            element: <VaccineCampaignDetails />,
          },
          {
            path: "vaccine-campaign/:id/register-list",
            element: <VaccineStudentList />,
          },
          {
            path: "regular-checkup",
            element: <RegularCheckup />,
          },
          {
            path: "checkup-campaign/:campaign_id",
            element: <RegularCheckupDetails />,
          },
          {
            path: "checkup-campaign-creation",
            element: <RegularCheckupCampaignForm />,
          },
          {
            path: "checkup-campaign/:campaign_id/register-list",
            element: <RegularCheckupRegisterList />,
          },
          {
            path: "checkup-campaign/:campaign_id/edit",
            element: <RegularCheckupCampaignForm />,
          },
          {
            path: "completed-regular-checkup-report/:campaign_id",
            element: <CompletedRegularCheckupReport />,
          },
          {
            path: "regular-checkup/specialty-management",
            element: <SpecialistExamManagement />,
          },
          {
            path: "vaccine-campaign/vaccine-management",
            element: <VaccineManagement />,
          },
          {
            path: "edit/:role/:id",
            element: <EditUserPage />,
          },
          {
            path: "create/:role",
            element: <CreateUserPage />,
          },
          {
            path: "regular-checkup-report/:campaign_id",
            element: <RegularCheckupReport />,
          },
          {
            path: "disease",
            element: <DiseaseRecordManagement />,
          },
          {
            path: "DeclarationManagement",
            element: <DeclarationManagement />,
          },
          {
            path: "blog",
            element: <BlogList />,
          },
          {
            path: "blog/create",
            element: <BlogEditor />,
          },
          {
            path: "blog/edit/:id",
            element: <BlogEditor />,
          },
          {
            path: "blog/:id",
            element: <ShowBlog />,
          },
          {
            path: "completed-vaccine-campaign-report/:campaign_id",
            element: <CompletedVaccineReport />,
          },
          {
            path: "student-overview/:student_id",
            element: <StudentOverview />,
          },
          {
            path: "vaccination-report/:campaign_id",
            element: <VaccineCampaignReport />,
          },
          {
            path: "vaccine-campaign/:campaign_id/edit",
            element: <UpdateVaccineCampaign />,
          },
          {
            path: "vaccine/:id/students",
            element: <VaccineForStudentEligible />,
          },
        ],
      },
    ],
  },
  {
    path: "/parent",
    element: <PrivateRoute allowedRoles={"parent"} />,
    children: [
      {
        path: "",
        element: <ParentDashboard />,
      },
      {
        path: "student-regular-checkup",
        element: <StudentRegularCheckup />,
      },
      {
        path: "schedule",
        element: <ParentSchedule />,
      },
      {
        path: "checkup-campaign/:campaign_id",
        element: <RegularCheckupDetails />,
      },
      {
        path: "vaccination-campaign/:id",
        element: <VaccineCampaignDetails />,
      },
      {
        path: "edit/:student_id",
        element: <ParentLayout />,
        children: [
          {
            path: "vaccine-campaign-survey/:campaign_id",
            element: <VaccineCampaignSurvey />,
          },
          {
            path: "health-profile",
            element: <StudentProfile />,
          },
          {
            path: "student-profile",
            element: <ParentEditStudentProfile />,
          },
          {
            path: "drug-table",
            element: <DrugTable />,
          },
          {
            path: "send-drug-form",
            element: <SendDrugForm />,
          },
          {
            path: "vaccine-info",
            element: <VaccineCampaignInfo />,
          },
          {
            path: "vaccine-info/:record_id",
            element: <VaccinationHistoryDetail />,
          },
          {
            path: "health-record",
            element: <HealthRecord />,
          },
          {
            path: "health-record/:record_id",
            element: <DetailHealthRecord />
          },
          {
            path: "regular-checkup",
            element: <ParentCheckupLayout />,
          },
          {
            path: "surveyCheckup/:campaign_id",
            element: <RegularCheckupSurvey />,
          },
          {
            path: "health-record-list",
            element: <HealthRecordList />,
          },
          {
            path: "history-declare-record",
            element: <HealthDeclarationHistory />,
          },
          {
            path: "vaccine-declare",
            element: <VaccineDeclarationForm />,
          },
          {
            path: "disease-declare",
            element: <DiseaseDeclarationForm />,
          },
          {
            path: "send-drug-form/:request_id",
            element: <SendDrugForm />,
          },
        ],
      },
    ],
  },
  {
    path: "/nurse",
    element: <PrivateRoute allowedRoles={"nurse"}/>,
    children: [
      {
        element: <AdminLayout />,
        children: [
          {
            path: "vaccination-report/:campaign_id",
            element: <VaccineCampaignReport />,
          },

          {
            path: "",
            element: <AdminDashboard />,
          },
          {
            path: "vaccine-campaign/:id/register-list",
            element: <VaccineStudentList />,
          },
          {
            path: "send-drug",
            element: <SendDrugManagement />,
          },
          {
            path: "daily-health",
            element: <DailyHealthRecord />,
          },
          {
            path: "daily-health/:record_id",
            element: <DetailHealthRecordForUpdate />
          },
          {
            path: "add-record",
            element: <AddRecordPage />,
          },
          {
            path: "vaccine-campaign",
            element: <VaccineCampaignManagement />,
          },
          {
            path: "vaccine-campaign/:id",
            element: <VaccineCampaignDetails />,
          },
          {
            path: "checkup-campaign/:campaign_id",
            element: <RegularCheckupDetails />,
          },
          {
            path: "checkup-campaign-creation",
            element: <RegularCheckupCampaignForm />,
          },
          {
            path: "checkup-campaign/:campaign_id/edit",
            element: <RegularCheckupCampaignForm />,
          },
          {
            path: "checkup-campaign/:campaign_id/register-list",
            element: <RegularCheckupRegisterList />,
          },
          {
            path: "regular-checkup",
            element: <RegularCheckup />,
          },
          {
            path: "regular-checkup-report/:campaign_id",
            element: <RegularCheckupReport />,
          },
          {
            path: "completed-vaccine-campaign-report/:campaign_id",
            element: <CompletedVaccineReport />,
          },
          {
            path: "completed-regular-checkup-report/:campaign_id",
            element: <CompletedRegularCheckupReport />,
          },
          {
            path: "regular-checkup/specialty-management",
            element: <SpecialistExamManagement />,
          },
          {
            path: "vaccine-campaign/vaccine-management",
            element: <VaccineManagement />,
          },
          {
            path: "disease",
            element: <DiseaseRecordManagement />,
          },
          {
            path: "DeclarationManagement",
            element: <DeclarationManagement />,
          },
          {
            path: "student-overview/:student_id",
            element: <StudentOverview />,
          },
          {
            path: "vaccine/:id/students",
            element: <VaccineForStudentEligible />,
          },

        ],
      },
    ],
  },
]);

export default routes;
