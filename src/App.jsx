import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import SignUp from "./pages/Register/Register";
import LogIn from "./pages/LogIn/LogIn";
import CompanyProfile from "./pages/CompanyProfile/CompanyProfile";
import Compare from "./pages/Compare/Compare";
import ResidentialSpace from "./pages/ResidentialSpace/Residentialspace";
import AdminLogin from "./pages/Admin/AdminLogin";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import AOS from "aos";
import "aos/dist/aos.css";
import InteriorDesigner from "./pages/InteriorDesigner/InteriorDesigner";
import ContactUs from "./pages/ContactUs/ContactUs";
import AboutUs from "./pages/AboutUs/AboutUs";
import Craftsmen from "./pages/Craftsmen/Craftsmen";
import DesignerForm from "./pages/InteriorDesigner/InteriorDesignerForm";
import CraftsmanForm from "./pages/Craftsmen/CraftsmanformTEMP";
import AdminHomePage from "./pages/Admin/AdminHomePage";
import AdminShowAllCompanies from "./pages/Admin/AdminShowAllCompanies";
import EditCompany from "./pages/Admin/EditCompany";
import TopRatedContext from "./Context/TopRatedContext";
import AdminDesignersList from "./pages/Admin/AdminDesignersList";
import AdminDesignerEdit from "./pages/Admin/AdminDesignerEdit";
import AdminCraftsmenList from "./pages/Admin/AdminCraftsmenList";
import AdminCraftsmanEdit from "./pages/Admin/AdminCraftsmanEdit";
import Estimator from "./pages/estimator/Estimator";
import PartnerWithUs from "./pages/PartnerWithUs/PartnerWithUs";
import AddBlogPage from "./pages/Blog/AddBLog";
import BlogPage from "./pages/Blog/Blog";
// Import the admin blog components
import AdminBlogList from "./pages/Admin/AdminBlogList";
import AdminBlogEdit from "./pages/Admin/AdminBlogEdit";
// Import testimonial management components
import AdminTestimonialsList from "./pages/Admin/AdminTestimonialsList";
import AdminTestimonialForm from "./pages/Admin/AdminTestimonialsForm";
import AdminEnquiriesPage from "./pages/Admin/AdminEnquiriesPage.jsx";
import ExportDataPage from "./pages/Admin/ExportDataPage.jsx";
import BlogDetail from "./pages/Blog/BlogDetail.jsx";
import AdminContactsView from "./pages/Admin/AdminContactsView.jsx";
import ImportDataPage from "./pages/Admin/ImportDataPage.jsx";

const App = () => {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  return (
    <TopRatedContext>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<LogIn />} />
        <Route path="/residential-space" element={<ResidentialSpace />} />
        <Route path="/interiordesigner" element={<InteriorDesigner />} />
        <Route path="/CompanyProfile/:id" element={<CompanyProfile />} />
        <Route path="/Compare" element={<Compare />} />
        <Route path="/Contact" element={<ContactUs />} />
        <Route path="/About" element={<AboutUs />} />
        <Route path="/add-designer" element={<DesignerForm />} />
        <Route path="/edit-designer/:id" element={<DesignerForm />} />
        <Route path="/craftsmen" element={<Craftsmen />} />
        <Route path="/add-craftsman" element={<CraftsmanForm />} />
        <Route path="/edit-craftsman/:id" element={<CraftsmanForm />} />
        <Route path="/add-company" element={<AdminDashboard />} />
        <Route path="/cost-estimator" element={<Estimator />} />
        <Route path="/partner-with-us" element={<PartnerWithUs />} />
        <Route path="/Blog" element={<BlogPage />} />
        <Route path="/add-blog" element={<AddBlogPage />} />
        <Route path="/blog/:id" element={<BlogDetail />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route
          path="/admin/home"
          element={
            <ProtectedRoute>
              <AdminHomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/showCompanies"
          element={
            <ProtectedRoute>
              <AdminShowAllCompanies />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/editCompany/:id"
          element={
            <ProtectedRoute>
              <EditCompany />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/designers"
          element={
            <ProtectedRoute>
              <AdminDesignersList />
            </ProtectedRoute>
          }
        />
        <Route path="/admin/designers/add" element={
          <ProtectedRoute>
            <AdminDesignerEdit />
          </ProtectedRoute>
        }
        />
        <Route path="/admin/designers/edit/:id" element={
          <ProtectedRoute>
            <AdminDesignerEdit />
          </ProtectedRoute>
        }
        />
        <Route path="/admin/craftsmen" element={
          <ProtectedRoute>
            <AdminCraftsmenList />
          </ProtectedRoute>
        } />
        <Route path="/admin/craftsmen/add" element={
          <ProtectedRoute>
            <AdminCraftsmanEdit />
          </ProtectedRoute>
        } />
        <Route path="/admin/craftsmen/edit/:id" element={
          <ProtectedRoute>
            <AdminCraftsmanEdit />
          </ProtectedRoute>
        } />

        {/* Admin Blog Management Routes */}
        <Route path="/admin/blogs" element={
          <ProtectedRoute>
            <AdminBlogList />
          </ProtectedRoute>
        } />
        <Route path="/admin/blogs/add" element={
          <ProtectedRoute>
            <AdminBlogEdit />
          </ProtectedRoute>
        } />
        <Route path="/admin/blogs/edit/:id" element={
          <ProtectedRoute>
            <AdminBlogEdit />
          </ProtectedRoute>
        } />
        <Route path="/admin/add-blog" element={
          <ProtectedRoute>
            <AddBlogPage />
          </ProtectedRoute>
        } />
        <Route
          path="/admin/enquiries"
          element={
            <ProtectedRoute>
              <AdminEnquiriesPage />
            </ProtectedRoute>
          }
        />
        {/* Admin Testimonials Management Routes */}
        <Route path="/admin/testimonials" element={
          <ProtectedRoute>
            <AdminTestimonialsList />
          </ProtectedRoute>
        } />
        <Route path="/admin/testimonials/add" element={
          <ProtectedRoute>
            <AdminTestimonialForm />
          </ProtectedRoute>
        } />
        <Route path="/admin/testimonials/edit/:id" element={
          <ProtectedRoute>
            <AdminTestimonialForm />
          </ProtectedRoute>
        } />
        <Route path="/admin/contacts" element={
          <ProtectedRoute>
            <AdminContactsView />
            </ProtectedRoute>
        } />
        {/* export data in CSV formate route */}
        <Route path="/admin/export-data" element={
          <ProtectedRoute>
            <ExportDataPage />
          </ProtectedRoute>
        } />
        {/*for import*/}
        <Route path="/admin/import-data" element={
          <ProtectedRoute>
          <ImportDataPage />
          </ProtectedRoute>
          } />
      </Routes>
    </TopRatedContext>
  );
};

export default App;