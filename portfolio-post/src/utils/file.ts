import fs from 'fs';
import path from 'path';

export const saveFiles = (folder: string, ...files: (Express.Multer.File | undefined)[]) => {
  files.forEach((file) => {
    if (file)
      fs.writeFileSync(
        path.resolve(__dirname, `../../media/${folder}/${file.filename}`),
        file.buffer,
      );
  });
};

export const removeFiles = (...filePaths: (string | undefined)[]) => {
  filePaths.forEach((filePath) => {
    if (filePath) fs.unlinkSync(path.join(__dirname, '../../media', filePath));
  });
};

export const createMediaFolders = () => {
  const folderPaths = [
    path.join(__dirname, '../../', 'media'),
    // path.join(__dirname, '../../', 'media/images'),
  ];

  for (const folder of folderPaths) {
    if (!fs.existsSync(folder)) fs.mkdirSync(folder);
  }
};
