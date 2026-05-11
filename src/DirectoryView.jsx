import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  FaFolder,
  FaFileAlt,
  FaFilePdf,
  FaFileImage,
  FaFileVideo,
  FaFileAudio,
  FaFileArchive,
  FaFileCode,
} from "react-icons/fa";
import { BASE_URL } from "../config";

function DirectoryView({ setUser }) {

  const [directoryItems, setDirectoryItems] = useState({});
  const [foldersList, setFoldersList] = useState([]);
  const [filesList, setFilesList] = useState([]);
  const [progress, setProgress] = useState(0);
  const [newFilename, setNewFilename] = useState("");
  const [renameTarget, setRenameTarget] = useState(null);
  const [renameId, setRenameId] = useState(null);
  const [newDirName, setNewDirName] = useState("");
  const [isDir, setIsDir] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const { "*": dirPath } = useParams("");
  const navigate = useNavigate();

  // ICONS
  function getFolderIcon() {
    return <FaFolder color="#f4c542" />;
  }

  function getFileIcon(filename) {
    const ext = filename.split(".").pop().toLowerCase();

    if (["png", "jpg", "jpeg", "gif"].includes(ext))
      return <FaFileImage color="#4da6ff" />;
    if (["mp4", "mkv", "avi"].includes(ext))
      return <FaFileVideo color="#ff6b6b" />;
    if (["mp3", "wav"].includes(ext)) return <FaFileAudio color="#a66bff" />;
    if (["zip", "rar"].includes(ext)) return <FaFileArchive color="#ffa94d" />;
    if (["js", "json", "html", "css"].includes(ext))
      return <FaFileCode color="#20c997" />;
    if (ext === "pdf") return <FaFilePdf color="#ff4d4f" />;

    return <FaFileAlt color="#ccc" />;
  }

  async function getDirectoryItems() {
    const res = await fetch(
      `${BASE_URL}/directory/${encodeURIComponent(dirPath || "")}`,
      {
        credentials: "include",
      },
    );
    const data = await res.json();

    setDirectoryItems(data);
    setFoldersList(data.folders || []);
    setFilesList(data.files || []);
  }

  useEffect(() => {
    getDirectoryItems();
  }, [dirPath]);

  async function uploadFile(e) {
    try {
      const file = e.target.files[0];
      if (!file) return;

      const xhr = new XMLHttpRequest();

      xhr.open("POST", `${BASE_URL}/file/${encodeURIComponent(dirPath || "")}`);

      xhr.setRequestHeader("filename", String(file.name));
      xhr.withCredentials = true;
      xhr.upload.addEventListener("progress", (e) => {
        setProgress(((e.loaded / e.total) * 100).toFixed(0));
      });

      xhr.onload = async () => {
        console.log("status:", xhr.status);
        await getDirectoryItems();
        // if (xhr.status === "200" || 201 || 204 || 304) {
        // } else {
        //   console.error("Upload failed:", xhr.responseText);
        // }
      };

      xhr.onerror = () => {
        console.error("Network error");
      };

      xhr.send(file);
    } catch (error) {
      console.log(error);
    }
  }

  async function deleteFile(id) {
    await fetch(`${BASE_URL}/file/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    await getDirectoryItems();
  }

  async function deleteFolders(id) {
    await fetch(`${BASE_URL}/directory/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    await getDirectoryItems();
  }

  function renameFile(filename, id) {
    setRenameTarget(filename);
    setRenameId(id);
    setNewFilename(String(filename));
  }

  async function saveFilename() {
    if (!renameTarget || !newFilename.trim()) return;

    if (!isDir) {
      await fetch(`${BASE_URL}/file/${renameId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newFilename }),
        credentials: "include",
      });
    } else {
      await fetch(`${BASE_URL}/directory/${renameId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newFilename }),
        credentials: "include",
      });
    }

    setRenameTarget(null);
    setRenameId(null);
    setNewFilename("");
    setIsDir(0);
    await getDirectoryItems();
  }

  async function handleNewDir(e) {
    e.preventDefault();

    await fetch(`${BASE_URL}/directory/${directoryItems._id}`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: newDirName }),
    });

    setNewDirName("");
    await getDirectoryItems();
  }

  // BACK NAVIGATION
  // BACK NAVIGATION (FIXED)
  function handleBack() {
    if (!dirPath) return; // 🔥 stop at root

    navigate(-1);
  }
  async function handleLogout() {
    await fetch(`${BASE_URL}/users/logout`, {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
    navigate("/auth");
  }
  async function handleLogoutAll() {
    await fetch(`${BASE_URL}/users/logoutAll`, {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
    navigate("/auth");
  }

  return !directoryItems ? (
    <h1>Loading</h1>
  ) : (
    <div className="container">
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "20px",
        }}
      >
        <button onClick={handleBack}>⬅ Back</button>
        <h2 style={{ margin: 0 }}>📂 {directoryItems?.name || "Root"}</h2>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: "12px",
          marginBottom: "20px",
        }}
      >
        <button onClick={handleLogout}>LogOut</button>
        <button onClick={handleLogoutAll}>LogOut All</button>
      </div>

      {/* Upload */}
      <div className="toolbar">
        <input type="file" onChange={uploadFile} />
        <span>{progress > 0 && `Uploading: ${progress}%`}</span>
      </div>

      {/* Create Folder */}
      <form onSubmit={handleNewDir} className="toolbar">
        <input
          type="text"
          placeholder="New Folder Name"
          value={newDirName}
          onChange={(e) => setNewDirName(e.target.value)}
        />
        <button type="submit">➕ Create</button>
      </form>

      {/* Rename */}
      <div className="toolbar">
        <input
          type="text"
          placeholder="Rename..."
          value={newFilename}
          onChange={(e) => setNewFilename(e.target.value)}
          disabled={!renameTarget}
        />
        <button
          onClick={saveFilename}
          disabled={!renameTarget || !newFilename.trim()}
        >
          💾 Save
        </button>
      </div>

      {/* Folders */}
      <div className="section">
        <div className="section-title">Folders</div>
        <div className="file-list">
          {foldersList?.map(({ name: item, _id: id }) => (
            <div className="file-item" key={id}>
              <div>
                {getFolderIcon()}
                <span className="file-name">{item}</span>
              </div>
              <div className="actions">
                <Link to={`/${id}`}>
                  <button>Open</button>
                </Link>
                <button
                  onClick={() => {
                    renameFile(item, id);
                    setIsDir(1);
                  }}
                >
                  Rename
                </button>
                <button onClick={() => deleteFolders(id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Files */}
      <div className="section">
        <div className="section-title">Files</div>
        <div className="file-list">
          {filesList?.map(({ name: item, _id: id }) => (
            <div className="file-item" key={id}>
              <div>
                {getFileIcon(item)}
                <span className="file-name">{item}</span>
              </div>
              <div className="actions">
                <a href={`${BASE_URL}/file/${id}?action=open`} target="_blank">
                  <button>Open</button>
                </a>
                <a href={`${BASE_URL}/file/${id}?action=download`}>
                  <button>Download</button>
                </a>
                <button onClick={() => renameFile(item, id)}>Rename</button>
                <button onClick={() => deleteFile(id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DirectoryView;
