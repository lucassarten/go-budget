// import { parse } from "csv-parse";
// import { Query } from "../../../wailsjs/go/main/Db";

// const fs = require("fs");

// // specific references to ignore, these are transfers between my own accounts for example, these rows are dropped
// const ignore = "Tf To|Tf Fr|T/f from|T/f to|TRANSFER|TRANSFER";
// // specific phrases to remove, these rows aren't dropped just cleaned for the below strings
// const remove = ";Ref:|;Particulars:|;Balance:|;";

// interface DarwinMenuItemConstructorOptions extends MenuItemConstructorOptions {
//   selector?: string;
//   submenu?: DarwinMenuItemConstructorOptions[] | Menu;
// }

// function importFile(fileName: string, type: string) {
//   // read file contents
//   let content: string[][] = [];
//   fs.createReadStream(fileName)
//     .pipe(parse({ delimiter: "," }))
//     .on("data", (row: string[]) => {
//       content.push(row);
//     })
//     .on("end", () => {
//       // drop header row
//       content = content.slice(1);
//       if (type === "TSB") {
//         // format columns
//         content = content.map((row) => [
//           row[0].trim(),
//           row[2].trim() + row[3].trim(),
//           row[1].trim(),
//         ]);
//         // convert to date format d-m-yyyy
//         content = content.map((row) => {
//           const date = row[0].split("/");
//           return [`${date[1]}-${date[0]}-${date[2]}`, row[1], row[2]];
//         });
//       } else if (type === "KiwiBank") {
//         // format columns
//         content = content.map((row) => [
//           row[1].trim(),
//           row[2].trim(),
//           row[14].trim(),
//         ]);
//         // convert to date format d-m-yyyy, data is in format dd-mm-yyyy
//         content = content.map((row) => {
//           const date = row[0].split("-");
//           return [
//             `${date[1]}-${date[0]}-${date[2].substring(2)}`,
//             row[1],
//             row[2],
//           ];
//         });
//       }
//       // remove ignored rows
//       content = content.filter((row) => !row[1].match(ignore));
//       // remove unwanted strings
//       content = content.map((row) => [
//         row[0],
//         row[1].replace(remove, ""),
//         row[2],
//       ]);
//       // add default category
//       content = content.map((row) => [...row, "❓ Other"]);
//       // add to db in a transaction
//       db.serialize(() => {
//         db.run("BEGIN TRANSACTION");
//         content.forEach((row) => {
//           db.run(
//             "INSERT INTO Transactions (date, description, amount, category) VALUES (?, ?, ?, ?)",
//             row
//           );
//         });
//         db.run("COMMIT");
//       });
//     });
// }

// function selectFile(type: string) {
//   const result = dialog.showOpenDialogSync({
//     properties: ["openFile"],
//     filters: [{ name: "CSV", extensions: ["csv"] }],
//   });
//   if (result) {
//     importFile(result[0], type);
//   }
// }

// export default class MenuBuilder {
//   mainWindow: BrowserWindow;

//   constructor(mainWindow: BrowserWindow) {
//     this.mainWindow = mainWindow;
//   }

//   buildMenu(): Menu {
//     if (
//       process.env.NODE_ENV === "development" ||
//       process.env.DEBUG_PROD === "true"
//     ) {
//       this.setupDevelopmentEnvironment();
//     }

//     const template =
//       process.platform === "darwin"
//         ? this.buildDarwinTemplate()
//         : this.buildDefaultTemplate();

//     const menu = Menu.buildFromTemplate(template);
//     Menu.setApplicationMenu(menu);

//     return menu;
//   }

//   setupDevelopmentEnvironment(): void {
//     this.mainWindow.webContents.on("context-menu", (_, props) => {
//       const { x, y } = props;

//       Menu.buildFromTemplate([
//         {
//           label: "Inspect element",
//           click: () => {
//             this.mainWindow.webContents.inspectElement(x, y);
//           },
//         },
//       ]).popup({ window: this.mainWindow });
//     });
//   }

//   buildDarwinTemplate(): MenuItemConstructorOptions[] {
//     const subMenuAbout: DarwinMenuItemConstructorOptions = {
//       label: "Electron",
//       submenu: [
//         {
//           label: "About ElectronReact",
//           selector: "orderFrontStandardAboutPanel:",
//         },
//         { type: "separator" },
//         { label: "Services", submenu: [] },
//         { type: "separator" },
//         {
//           label: "Hide ElectronReact",
//           accelerator: "Command+H",
//           selector: "hide:",
//         },
//         {
//           label: "Hide Others",
//           accelerator: "Command+Shift+H",
//           selector: "hideOtherApplications:",
//         },
//         { label: "Show All", selector: "unhideAllApplications:" },
//         { type: "separator" },
//         {
//           label: "Quit",
//           accelerator: "Command+Q",
//           click: () => {
//             app.quit();
//           },
//         },
//       ],
//     };
//     const subMenuEdit: DarwinMenuItemConstructorOptions = {
//       label: "Edit",
//       submenu: [
//         { label: "Undo", accelerator: "Command+Z", selector: "undo:" },
//         { label: "Redo", accelerator: "Shift+Command+Z", selector: "redo:" },
//         { type: "separator" },
//         { label: "Cut", accelerator: "Command+X", selector: "cut:" },
//         { label: "Copy", accelerator: "Command+C", selector: "copy:" },
//         { label: "Paste", accelerator: "Command+V", selector: "paste:" },
//         {
//           label: "Select All",
//           accelerator: "Command+A",
//           selector: "selectAll:",
//         },
//       ],
//     };
//     const subMenuViewDev: MenuItemConstructorOptions = {
//       label: "View",
//       submenu: [
//         {
//           label: "Reload",
//           accelerator: "Command+R",
//           click: () => {
//             this.mainWindow.webContents.reload();
//           },
//         },
//         {
//           label: "Toggle Full Screen",
//           accelerator: "Ctrl+Command+F",
//           click: () => {
//             this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
//           },
//         },
//         {
//           label: "Toggle Developer Tools",
//           accelerator: "Alt+Command+I",
//           click: () => {
//             this.mainWindow.webContents.toggleDevTools();
//           },
//         },
//       ],
//     };
//     const subMenuViewProd: MenuItemConstructorOptions = {
//       label: "View",
//       submenu: [
//         {
//           label: "Toggle Full Screen",
//           accelerator: "Ctrl+Command+F",
//           click: () => {
//             this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
//           },
//         },
//       ],
//     };
//     const subMenuWindow: DarwinMenuItemConstructorOptions = {
//       label: "Window",
//       submenu: [
//         {
//           label: "Minimize",
//           accelerator: "Command+M",
//           selector: "performMiniaturize:",
//         },
//         { label: "Close", accelerator: "Command+W", selector: "performClose:" },
//         { type: "separator" },
//         { label: "Bring All to Front", selector: "arrangeInFront:" },
//       ],
//     };

//     const subMenuView =
//       process.env.NODE_ENV === "development" ||
//       process.env.DEBUG_PROD === "true"
//         ? subMenuViewDev
//         : subMenuViewProd;

//     return [subMenuAbout, subMenuEdit, subMenuView, subMenuWindow];
//   }

//   buildDefaultTemplate() {
//     const templateDefault = [
//       {
//         label: "&File",
//         submenu: [
//           {
//             label: "&Close",
//             accelerator: "Ctrl+W",
//             click: () => {
//               this.mainWindow.close();
//             },
//           },
//         ],
//       },
//       {
//         label: "&View",
//         submenu:
//           process.env.NODE_ENV === "development" ||
//           process.env.DEBUG_PROD === "true"
//             ? [
//                 {
//                   label: "&Reload",
//                   accelerator: "Ctrl+R",
//                   click: () => {
//                     this.mainWindow.webContents.reload();
//                   },
//                 },
//                 {
//                   label: "Toggle &Full Screen",
//                   accelerator: "F11",
//                   click: () => {
//                     this.mainWindow.setFullScreen(
//                       !this.mainWindow.isFullScreen()
//                     );
//                   },
//                 },
//                 {
//                   label: "Toggle &Developer Tools",
//                   accelerator: "Alt+Ctrl+I",
//                   click: () => {
//                     this.mainWindow.webContents.toggleDevTools();
//                   },
//                 },
//               ]
//             : [
//                 {
//                   label: "&Reload",
//                   accelerator: "Ctrl+R",
//                   click: () => {
//                     this.mainWindow.webContents.reload();
//                   },
//                 },
//                 {
//                   label: "Toggle &Full Screen",
//                   accelerator: "F11",
//                   click: () => {
//                     this.mainWindow.setFullScreen(
//                       !this.mainWindow.isFullScreen()
//                     );
//                   },
//                 },
//               ],
//       },
//       {
//         label: "&Import",
//         submenu: [
//           {
//             label: "&TSB CSV File",
//             click: () => {
//               selectFile("TSB");
//             },
//           },
//           {
//             label: "&KiwiBank CSV File",
//             click: () => {
//               selectFile("KiwiBank");
//             },
//           },
//         ],
//       },
//     ];

//     return templateDefault;
//   }
// }

export {}