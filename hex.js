class HEX {
    even = n => !(n % 2); //проверка на четность
    constructor(HexStringInput) {
        //Formats a string in a group of n characters
        String.prototype.format = function (n) {
            let pattern = new RegExp("(.{" + n + "})", "g");
            return this.match(pattern).map(part => part.match(/(.{2})/g).join(" "))
        };
        //Splits string by n characters and reverse 2-chars group inside substrings.
        String.prototype.mirror = function (n) {
            let pattern = new RegExp("(.{" + n + "})", "g");
            return this.match(pattern).map(part => part.match(/(.{2})/g).reverse().join("")).join("");
        }
        //Big Endian    (false)
        this.DCBAbuffer = null; //Little Endian (true)
        //Mid-Big Endian (false)
        this.CDABbuffer = null; //Mid-Little Endian (true)
        this._viewABCD = null;
        this._viewBADC = null;
        this._hexText = HexStringInput;
        this._hexText2 = '';
        this._wordArrayABCD = [];
        this._wordArrayBADC = [];
        this._bytesCount = 0;
        this._wordsCount = 0;
        this._dwordsCount = 0;
        this._analyze();
        //Formats a string in a group of n characters
        String.prototype.format = function (n) {
            let pattern = new RegExp("(.{" + n + "})", "g");
            return this.match(pattern).map(part => part.match(/(.{2})/g).join(" "))
        };
        //Splits string by n characters and reverse 2-chars group inside substrings.
        String.prototype.mirror = function (n) {
            let pattern = new RegExp("(.{" + n + "})", "g");
            return this.match(pattern).map(part => part.match(/(.{2})/g).reverse().join("")).join("");
        }
    }

    /*!!!!*/
    //check the validity of input string
    _checkString() {
        this._hexText = this._hexText.toUpperCase();
        this._hexText = this._hexText.replace(/[^A-F0-9]/g, "");
        return this._hexText.length;
    }

    //
    _analyze() {
        if (this._checkString()) { //проверка на валидность строки
            this._normalize();
            this._wordArrayABCD = this._hexText.match(/(.{2})/g).map(
                (el) => {
                    return parseInt(el, 16);
                }
            );
            this._hexText2 = this._hexText.mirror(4);
            this._wordArrayBADC = this._hexText2.match(/(.{2})/g).map(
                (el) => {
                    return parseInt(el, 16);
                }
            );
            //мой метод дополнения нулей перед числом.
            //this._hexText="0".repeat((4-this._hexText.length%4)<4?(4-this._hexText.length%4):0)+this._hexText;

            this._dwordsCount = this._wordArrayABCD.length / 4;

            this.DCBAbuffer = new Uint8Array(this._wordArrayABCD).buffer;
            this._viewABCD = new DataView(this.DCBAbuffer);

            this.CDABbuffer = new Uint8Array(this._wordArrayBADC).buffer;
            this._viewBADC = new DataView(this.CDABbuffer);

        }
    }

    _normalize() {
        //добавление нулей для нечетного числа символов
        if (!this.even(this._hexText.length)) {
            this._hexText = "0" + this._hexText;
        }
        this._bytesCount = this._hexText.length / 2;
        //добавление нулей для недостающих word
        if (this._hexText.length % 4) {
            this._hexText += "00";
        }
        this._wordArrayABCD = this._hexText.match(/(.{4})/g).map(
            (el) => {
                return parseInt(el, 16);
            }
        );
        this._wordsCount = this._wordArrayABCD.length;
        //добавление нулей для недостающих DWord
        if (this._hexText.length % 8) {
            this._hexText += "0000";
        }

    }

    /// get words count
    get wordsCount() {
        return this._wordsCount;
    }
    ///get double words count
    get dwordsCount() {
        return this._dwordsCount;
    }
    ///Get Hex String
    get getHexString() {
        return this._hexText.match(/(.{2})/g).join("\t");
    }

    ///Get Dec String
    get getDecString() {
        return this._hexText.match(/(.{2})/g).map((el) => {
            let dec = parseInt(el, 16);
            let sdec = String(dec);
            return "0".repeat((3 - sdec.length % 3) < 3 ? (3 - sdec.length % 3) : 0) + sdec
        }).join("\t");
    }

    ///Get ASCII
    get getASCII() {
        return this.getUint8.value.map(el => String.fromCharCode(el)).join("");
    }
    ///Binary
    get getBinary() {
        let arr = [];
        for (let i = 0; i < this._wordsCount; i++) {
            arr[i] = this._viewABCD.getUint16(i * 2, false).toString(2);
            arr[i] = ("0".repeat(16 - arr[i].length) + arr[i]).match(/(.{8})/g).join(" ");
        }
        return {
            hex: this._hexText.format(4),
            value: arr
        };
    }
    //UINT8
    get getUint8() {
        let arr = [];
        for (let i = 0; i < this._bytesCount; i++) {
            arr[i] = this._viewABCD.getUint8(i, false);
        }
        return {
            hex: this._hexText.format(2),
            value: arr
        };
    }

    ///UINT16 - Big Endian (AB)
    get getUint16AB() {
        let arr = [];
        for (let i = 0; i < this._wordsCount; i++) {
            arr[i] = this._viewABCD.getUint16(i * 2, false);
        }
        return {
            hex: this._hexText.format(4),
            value: arr
        };
    }
    ///UINT16 - Little Endian (BA)
    get getUint16BA() {
        let arr = [];
        for (let i = 0; i < this._wordsCount; i++) {
            arr[i] = this._viewABCD.getUint16(i * 2, true);
        }
        return {
            hex: this._hexText.mirror(4).format(4),
            value: arr
        };
    }
    ///INT16 - Big Endian (AB)
    get getInt16AB() {
        let arr = [];
        for (let i = 0; i < this._wordsCount; i++) {
            arr[i] = this._viewABCD.getInt16(i * 2, false);
        }
        return {
            hex: this._hexText.format(4),
            value: arr
        };
    }
    ///INT16 - Little Endian (BA)
    get getInt16BA() {
        let arr = [];
        for (let i = 0; i < this._wordsCount; i++) {
            arr[i] = this._viewABCD.getInt16(i * 2, true);
        }
        return {
            hex: this._hexText.mirror(4).format(4),
            value: arr
        };
    }
    ///UINT32 - Big Endian (ABCD)
    get getUint32ABCD() {
        let arr = [];
        for (let i = 0; i < this._dwordsCount; i++) {
            arr[i] = this._viewABCD.getUint32(i * 4, false);
        }
        return {
            hex: this._hexText.format(8),
            value: arr
        };
    }
    ///UINT32 - Little Endian (DCBA)
    get getUint32DCBA() {
        let arr = [];
        for (let i = 0; i < this._dwordsCount; i++) {
            arr[i] = this._viewABCD.getUint32(i * 4, true);
        }
        return {
            hex: this._hexText.mirror(8).format(8),
            value: arr
        };
    }
    ///UINT32 - Mid-Big Endian (BADC)
    get getUint32BADC() {
        let arr = [];
        for (let i = 0; i < this._dwordsCount; i++) {
            arr[i] = this._viewBADC.getUint32(i * 4, false);
        }
        return {
            hex: this._hexText2.format(8),
            value: arr
        };
    }
    ///UINT32 - Mid-Little Endian (CDAB)
    get getUint32CDAB() {
        let arr = [];
        for (let i = 0; i < this._dwordsCount; i++) {
            arr[i] = this._viewBADC.getUint32(i * 4, true);
        }
        return {
            hex: this._hexText2.mirror(8).format(8),
            value: arr
        };
    }
    ///INT32 - Big Endian (ABCD)
    get getInt32ABCD() {
        let arr = [];
        for (let i = 0; i < this._dwordsCount; i++) {
            arr[i] = this._viewABCD.getInt32(i * 4, false);
        }
        return {
            hex: this._hexText.format(8),
            value: arr
        };
    }
    ///INT32 - Little Endian (DCBA)
    get getInt32DCBA() {
        let arr = [];
        for (let i = 0; i < this._dwordsCount; i++) {
            arr[i] = this._viewABCD.getInt32(i * 4, true);
        }
        return {
            hex: this._hexText.mirror(8).format(8),
            value: arr
        };
    }
    ///INT32 - Mid-Big Endian (BADC)
    get getInt32BADC() {
        let arr = [];
        for (let i = 0; i < this._dwordsCount; i++) {
            arr[i] = this._viewBADC.getInt32(i * 4, false);
        }
        return {
            hex: this._hexText2.format(8),
            value: arr
        };
    }
    ///INT32 - Mid-Little Endian (CDAB)
    get getInt32CDAB() {
        let arr = [];
        for (let i = 0; i < this._dwordsCount; i++) {
            arr[i] = this._viewBADC.getInt32(i * 4, true);
        }
        return {
            hex: this._hexText2.mirror(8).format(8),
            value: arr
        };
    }
    ///Float32 - Big Endian (ABCD)
    get getFloat32ABCD() {
        let arr = [];
        for (let i = 0; i < this._dwordsCount; i++) {
            arr[i] = this._viewABCD.getFloat32(i * 4, false);
        }
        return {
            hex: this._hexText.format(8),
            value: arr
        };
    }
    ///Float32 - Little Endian (DCBA)
    get getFloat32DCBA() {
        let arr = [];
        for (let i = 0; i < this._dwordsCount; i++) {
            arr[i] = this._viewABCD.getFloat32(i * 4, true);
        }
        return {
            hex: this._hexText.mirror(8).format(8),
            value: arr
        };
    }
    ///Float32 - Mid-Big Endian (BADC)
    get getFloat32BADC() {
        let arr = [];
        for (let i = 0; i < this._dwordsCount; i++) {
            arr[i] = this._viewBADC.getFloat32(i * 4, false);
        }
        return {
            hex: this._hexText2.format(8),
            value: arr
        };
    }
    ///Float32 - Mid-Little Endian (CDAB)
    get getFloat32CDAB() {
        let arr = [];
        for (let i = 0; i < this._dwordsCount; i++) {
            arr[i] = this._viewBADC.getFloat32(i * 4, true);
        }
        return {
            hex: this._hexText2.mirror(8).format(8),
            value: arr
        };
    }
}
