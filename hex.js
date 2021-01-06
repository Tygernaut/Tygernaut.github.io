class HEX {
    even = n => !(n % 2); //проверка на четность
    BADC = s => {
        return s.match(/(.{4})/g).map(part => part.match(/(.{2})/g).reverse().join("")).join("");
    };
    DCBA = s => {
        return s.match(/(.{8})/g).map(part => part.match(/(.{2})/g).reverse().join("")).join("");
    };
    constructor(HexStringInput) {
        //Big Endian	(false)
        this.DCBAbuffer = null; //Little Endian (true)
        //Mid-Big Endian (false)
        this.CDABbuffer = null; //Mid-Little Endian (true)
        this._view_ABCD = null;
        this._view_BADC = null;
        this._HexText = HexStringInput;
        this._HexText2 = '';
        this._wordArray_ABCD = [];
        this._wordArray_BADC = [];
        this.WordsCount = 0;
        this.DwordsCount = 0;
        this.QwordsCount = 0;
        this._analyze();
    }

    /*!!!!*/
    //check the validity of input string
    _checkString() {
        this._HexText.toUpperCase();
        return true;
    }

    //
    _analyze() {
        if (this._checkString()) { //проверка на валидность строки
            this._normalize();
            this._wordArray_ABCD = this._HexText.match(/(.{2})/g).map(
                (el) => {
                    return parseInt(el, 16);
                }
            );
            this._HexText2 = this.BADC(this._HexText);
            this._wordArray_BADC = this._HexText2.match(/(.{2})/g).map(
                (el) => {
                    return parseInt(el, 16);
                }
            );
            //мой метод дополнения нулей перед числом.
            //this._HexText="0".repeat((4-this._HexText.length%4)<4?(4-this._HexText.length%4):0)+this._HexText;

            this.DwordsCount = this._wordArray_ABCD.length / 4;

            this.DCBAbuffer = new Uint8Array(this._wordArray_ABCD).buffer;
            this._view_ABCD = new DataView(this.DCBAbuffer);

            this.CDABbuffer = new Uint8Array(this._wordArray_BADC).buffer;
            this._view_BADC = new DataView(this.CDABbuffer);

        }
    }


    printData(view) {
        for (let i = 0; i < this.WordsCount; i++) {
            console.log(i * 2, " Int16 AB", view.getInt16(i * 2, false))
        }
        console.log("");
        for (let i = 0; i < this.WordsCount; i++) {
            console.log(i * 2, " Int16 BA", view.getInt16(i * 2, true))
        }
        console.log("");
        for (let i = 0; i < this.WordsCount; i++) {
            console.log(i * 2, " Uint16 AB", view.getUint16(i * 2, false))
        }
        console.log("");
        for (let i = 0; i < this.WordsCount; i++) {
            console.log(i * 2, " Uint16 BA", view.getUint16(i * 2, true))
        }

        console.log("");
        for (let i = 0; i < this.DwordsCount; i++) {
            console.log(i * 4, " Uint32 ABCD", view.getUint32(i * 4, false))
        }
        console.log("");
        for (let i = 0; i < this.DwordsCount; i++) {
            console.log(i * 4, " Uint32 DCBA", view.getUint32(i * 4, true))
        }

        console.log("");
        for (let i = 0; i < this.DwordsCount; i++) {
            console.log(i * 4, " Int32 ABCD", view.getInt32(i * 4, false))
        }
        console.log("");
        for (let i = 0; i < this.DwordsCount; i++) {
            console.log(i * 4, " Int32 DCBA", view.getInt32(i * 4, true))
        }

        console.log("");
        for (let i = 0; i < this.DwordsCount; i++) {
            console.log(i * 4, " Float32 ABCD", view.getFloat32(i * 4, false))
        }
        console.log("");
        for (let i = 0; i < this.DwordsCount; i++) {
            console.log(i * 4, " Float32 DCBA", view.getFloat32(i * 4, true))
        }


    }
    _normalize() {
        //добавление нулей для нечетного числа символов
        if (!this.even(this._HexText.length)) {
            this._HexText = "0" + this._HexText;
        }
        //добавление нулей для недостающих word
        if (this._HexText.length % 4) {
            this._HexText += "00";
        }
        this._wordArray_ABCD = this._HexText.match(/(.{4})/g).map(
            (el) => {
                return parseInt(el, 16);
            }
        );
        this.WordsCount = this._wordArray_ABCD.length;
        //добавление нулей для недостающих DWord
        if (this._HexText.length % 8) {
            this._HexText += "0000";
        }

    }
    _build() {

    }
    ///UINT16 - Big Endian (AB)
    get getUint16AB() {
        let arr = [];
        for (let i = 0; i < this.WordsCount; i++) {
            arr[i] = this._view_ABCD.getUint16(i * 2, false);
        }
        return {
            hex: this._HexText.match(/(.{4})/g).map(part => part.match(/(.{2})/g).join(" ")),
            value: arr
        };
    }
    ///UINT16 - Little Endian (BA)
    get getUint16BA() {
        let arr = [];
        for (let i = 0; i < this.WordsCount; i++) {
            arr[i] = this._view_ABCD.getUint16(i * 2, true);
        }
        return {
            hex: this.BADC(this._HexText).match(/(.{4})/g).map(part => part.match(/(.{2})/g).join(" ")),
            value: arr
        };
    }
    ///INT16 - Big Endian (AB)
    get getInt16AB() {
        let arr = [];
        for (let i = 0; i < this.WordsCount; i++) {
            arr[i] = this._view_ABCD.getInt16(i * 2, false);
        }
        return {
            hex: this._HexText.match(/(.{4})/g).map(part => part.match(/(.{2})/g).join(" ")),
            value: arr
        };
    }
    ///INT16 - Little Endian (BA)
    get getInt16BA() {
        let arr = [];
        for (let i = 0; i < this.WordsCount; i++) {
            arr[i] = this._view_ABCD.getInt16(i * 2, true);
        }
        return {
            hex: this.BADC(this._HexText).match(/(.{4})/g).map(part => part.match(/(.{2})/g).join(" ")),
            value: arr
        };
    }
    ///UINT32 - Big Endian (ABCD)
    get getUint32ABCD() {
        let arr = [];
        for (let i = 0; i < this.DwordsCount; i++) {
            arr[i] = this._view_ABCD.getUint32(i * 4, false);
        }
        return {
            hex: this._HexText.match(/(.{8})/g).map(part => part.match(/(.{2})/g).join(" ")),
            value: arr
        };
    }
    ///UINT32 - Little Endian (DCBA)
    get getUint32DCBA() {
        let arr = [];
        for (let i = 0; i < this.DwordsCount; i++) {
            arr[i] = this._view_ABCD.getUint32(i * 4, true);
        }
        return {
            hex: this.DCBA(this._HexText).match(/(.{8})/g).map(part => part.match(/(.{2})/g).join(" ")),
            value: arr
        };
    }
    ///UINT32 - Mid-Big Endian (BADC)
    get getUint32BADC() {
        let arr = [];
        for (let i = 0; i < this.DwordsCount; i++) {
            arr[i] = this._view_BADC.getUint32(i * 4, false);
        }
        return {
            hex: this._HexText2.match(/(.{8})/g).map(part => part.match(/(.{2})/g).join(" ")),
            value: arr
        };
    }
    ///UINT32 - Mid-Little Endian (CDAB)
    get getUint32CDAB() {
        let arr = [];
        for (let i = 0; i < this.DwordsCount; i++) {
            arr[i] = this._view_BADC.getUint32(i * 4, true);
        }
        return {
            hex: this.DCBA(this._HexText2).match(/(.{8})/g).map(part => part.match(/(.{2})/g).join(" ")),
            value: arr
        };
    }
    ///INT32 - Big Endian (ABCD)
    get getInt32ABCD() {
        let arr = [];
        for (let i = 0; i < this.DwordsCount; i++) {
            arr[i] = this._view_ABCD.getInt32(i * 4, false);
        }
        return {
            hex: this._HexText.match(/(.{8})/g).map(part => part.match(/(.{2})/g).join(" ")),
            value: arr
        };
    }
    ///INT32 - Little Endian (DCBA)
    get getInt32DCBA() {
        let arr = [];
        for (let i = 0; i < this.DwordsCount; i++) {
            arr[i] = this._view_ABCD.getInt32(i * 4, true);
        }
        return {
            hex: this.DCBA(this._HexText).match(/(.{8})/g).map(part => part.match(/(.{2})/g).join(" ")),
            value: arr
        };
    }
    ///INT32 - Mid-Big Endian (BADC)
    get getInt32BADC() {
        let arr = [];
        for (let i = 0; i < this.DwordsCount; i++) {
            arr[i] = this._view_BADC.getInt32(i * 4, false);
        }
        return {
            hex: this._HexText2.match(/(.{8})/g).map(part => part.match(/(.{2})/g).join(" ")),
            value: arr
        };
    }
    ///INT32 - Mid-Little Endian (CDAB)
    get getInt32CDAB() {
        let arr = [];
        for (let i = 0; i < this.DwordsCount; i++) {
            arr[i] = this._view_BADC.getInt32(i * 4, true);
        }
        return {
            hex: this.DCBA(this._HexText2).match(/(.{8})/g).map(part => part.match(/(.{2})/g).join(" ")),
            value: arr
        };
    }
    ///Float32 - Big Endian (ABCD)
    get getFloat32ABCD() {
        let arr = [];
        for (let i = 0; i < this.DwordsCount; i++) {
            arr[i] = this._view_ABCD.getFloat32(i * 4, false);
        }
        return {
            hex: this._HexText.match(/(.{8})/g).map(part => part.match(/(.{2})/g).join(" ")),
            value: arr
        };
    }
    ///Float32 - Little Endian (DCBA)
    get getFloat32DCBA() {
        let arr = [];
        for (let i = 0; i < this.DwordsCount; i++) {
            arr[i] = this._view_ABCD.getFloat32(i * 4, true);
        }
        return {
            hex: this.DCBA(this._HexText).match(/(.{8})/g).map(part => part.match(/(.{2})/g).join(" ")),
            value: arr
        };
    }
    ///Float32 - Mid-Big Endian (BADC)
    get getFloat32BADC() {
        let arr = [];
        for (let i = 0; i < this.DwordsCount; i++) {
            arr[i] = this._view_BADC.getFloat32(i * 4, false);
        }
        return {
            hex: this._HexText2.match(/(.{8})/g).map(part => part.match(/(.{2})/g).join(" ")),
            value: arr
        };
    }
    ///Float32 - Mid-Little Endian (CDAB)
    get getFloat32CDAB() {
        let arr = [];
        for (let i = 0; i < this.DwordsCount; i++) {
            arr[i] = this._view_BADC.getFloat32(i * 4, true);
        }
        return {
            hex: this.DCBA(this._HexText2).match(/(.{8})/g).map(part => part.match(/(.{2})/g).join(" ")),
            value: arr
        };
    }
}
