# How to upload to cPanel (when dist.zip is blocked)

If cPanel blocks `dist.zip` as a virus (false positive), use one of these methods.

---

## Option 1: Upload files directly (no zip) – recommended

The virus scan runs on **zip files**. If you upload **individual files**, it usually does not block.

### Steps

1. **Build**
   ```bash
   npm run build
   ```

2. **Open the `dist` folder** on your computer (inside your project).

3. **In cPanel File Manager**
   - Go to the folder where the site should run (e.g. `public_html` or a subdomain folder).
   - Click **Upload**.

4. **Upload the contents of `dist`** (not the folder itself):
   - Drag and drop **all files** from `dist`: `index.html`, `favicon.svg`, `vite.svg`.
   - Drag and drop the **`assets` folder** (with all files inside it).
   - Or use “Select File” and choose each file/folder.

5. Your folder should look like:
   ```
   public_html/
     index.html
     favicon.svg
     vite.svg
     assets/
       index-xxxxx.js
       index-xxxxx.css
   ```

---

## Option 2: Upload via FTP (no zip)

FTP often uses a different scanner and may not block your files.

1. **Build**
   ```bash
   npm run build
   ```

2. **Connect with FTP** (e.g. FileZilla) using your cPanel FTP user/password.

3. **Go to the site folder** (e.g. `public_html`).

4. **Upload the contents of `dist`**:
   - Upload `index.html`, `favicon.svg`, `vite.svg`.
   - Upload the whole `assets` folder (with everything inside).

---

## Option 3: Use .tar.gz instead of .zip

Some hosts only scan `.zip`. You can try a gzipped tarball.

1. **Build and create archive**
   ```bash
   npm run build:tar
   ```
   This creates **`dist.tar.gz`** in your project root.

2. **Upload `dist.tar.gz`** in cPanel File Manager.

3. **Extract on the server**
   - Right‑click `dist.tar.gz` → Extract (or use the Extract button).
   - Move the extracted files (e.g. `index.html`, `assets/`) into `public_html` (or your web root) if they were extracted into a subfolder.

---

## Option 4: Ask your host to whitelist

Contact your hosting support and say:

- The file is a **Vite/React build** (front-end only).
- The detection **Sanesecurity.Foxhole.JS_Zip_4.UNOFFICIAL** is a **false positive** on minified JavaScript inside the zip.
- Ask them to **whitelist** your `dist.zip` or your account’s uploads for this case.

---

**Fastest workaround:** Use **Option 1** (upload the contents of `dist` without zipping).
