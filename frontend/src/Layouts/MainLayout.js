import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

function MainLayout({ children }) {

  return (
    <div style={{ display: "flex", height: "100vh" }}>

      <Sidebar />

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>

        <Header />

        <div style={{
          height: "20px",
          padding: "0px 10px",
          background: "#f3f4f6",
          flex: 1
        }}>
          {children}
        </div>

      </div>

    </div>
  );
}

export default MainLayout;