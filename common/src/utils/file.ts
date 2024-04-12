import fs from 'fs';
import path from 'path';

const saveFiles = (folder: string, ...files: (Express.Multer.File | undefined)[]) => {
  files.forEach((file) => {
    if (file)
      fs.writeFileSync(
        path.resolve(__dirname, `../../../../../media/${folder}/${file.filename}`),
        file.buffer,
      );
  });
};

const removeFiles = (...filePaths: (string | undefined)[]) => {
  filePaths.forEach((filePath) => {
    if (filePath) fs.unlinkSync(path.join(__dirname, '../../../../../media', filePath));
  });
};

export const Files = { saveFiles, removeFiles };
