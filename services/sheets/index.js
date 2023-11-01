import { JWT } from "google-auth-library";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY } from "../../config.js";

const SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive.file",
];

class GoogleSheetService {
  jwtFromEnv = undefined;
  doc = undefined;

  constructor(id = undefined) {
    if (!id) {
      throw new Error("ID_UNDEFINED");
    }

    this.jwtFromEnv = new JWT({
      email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      scopes: SCOPES,
    });
    this.doc = new GoogleSpreadsheet(id, this.jwtFromEnv);
  }

  /**
   * Recuperar el menu del dia
   * @param {*} dayNumber
   * @returns
   */
  retriveDayMenu = async (dayNumber = 0) => {
    try {
      const list = [];
      await this.doc.loadInfo();
      const sheet = this.doc.sheetsByIndex[0]; // the first sheet
      await sheet.loadCells("A1:H10");
      const rows = await sheet.getRows();
      for (const a of Array.from(Array(rows.length).keys())) {
        const cellA1 = sheet.getCell(a + 1, dayNumber - 1);
        list.push(cellA1.value);
      }

      return list;
    } catch (err) {
      console.log(err);
      return undefined;
    }
  };

  /**
   * Guardar pedido
   * @param {*} data
   */
  saveOrder = async (data = {}) => {
    try {
      await this.doc.loadInfo();
      const sheet = this.doc.sheetsByIndex[1];

      const order = await sheet.addRow({
        fecha: data.fecha,
        nombre: data.nombre,
        telefono: data.telefono,
        casa: data.casa,
        observaciones: data.obs
      });

      return order;
    } catch (error) {
      console.log("[ERROR][SAVE ORDER] ------------------->", error);
    };
  };
}

export default GoogleSheetService;
