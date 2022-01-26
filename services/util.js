'use strict';
const _ = require('lodash');
// const iplocation = require('iplocation').default;
const moment = require('moment');

module.exports = {
    /**
     * @description generate slug from string
     * @param text
     * @return {string}
     */
    slugify: (text) => {
        return text
            .toString()
            .toLowerCase()
            .replace(/\s+/g, '-') // Replace spaces with -
            .replace(/[^\w\-]+/g, '') // Remove all non-word chars
            .replace(/\-\-+/g, '-') // Replace multiple - with single -
            .replace(/^-+/, '') // Trim - from start of text
            .replace(/-+$/, '');
    },
    randomString(strLength) {
        let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXTZ123456abcdefghiklmnopqrstuvwxyz';
        let string_length = strLength || 8;
        let randomstring = '';
        let charCount = 0;
        let numCount = 0;

        for (let i = 0; i < string_length; i++) {
            // If random bit is 0, there are less than 3 digits already saved, and there are not already 5 characters saved, generate a numeric value.
            if (
                (Math.floor(Math.random() * 2) == 0 && numCount < 3) ||
                charCount >= 5
            ) {
                let rnum = Math.floor(Math.random() * 10);
                randomstring += rnum;
                numCount += 1;
            } else {
                // If any of the above criteria fail, go ahead and generate an alpha character from the chars string
                let rnum = Math.floor(Math.random() * chars.length);
                randomstring += chars.substring(rnum, rnum + 1);
                charCount += 1;
            }
        }

        return randomstring;
    },
    randomPassword(strLength) {
        let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXTZ123456abcdefghiklmnopqrstuvwxyz';
        let string_length = strLength || 8;
        let randomstring = '';
        let charCount = 0;
        let numCount = 0;

        for (let i = 0; i < string_length; i++) {
            // If random bit is 0, there are less than 3 digits already saved, and there are not already 5 characters saved, generate a numeric value.
            if (
                (Math.floor(Math.random() * 2) == 0 && numCount < 3) ||
                charCount >= 5
            ) {
                let rnum = Math.floor(Math.random() * 10);
                randomstring += rnum;
                numCount += 1;
            } else {
                // If any of the above criteria fail, go ahead and generate an alpha character from the chars string
                let rnum = Math.floor(Math.random() * chars.length);
                randomstring += chars.substring(rnum, rnum + 1);
                charCount += 1;
            }
        }

        return `P${randomstring}1`;
    },

    /**
     * @description: humanize string into readable format
     * @param str
     */
    humanize: (str) => {
        return str
            .replace(/^[\s_]+|[\s_]+$/g, '')
            .replace(/[_\s]+/g, ' ')
            .replace(/^[a-z]/, (m) => {
                return m.toUpperCase();
            });
    },
    /**
     * Merge multiple objects into one
     * @param roles
     * @returns {*}
     */
    mergeObjects: function (roles) {
        // Custom merge function ORs together non-object values, recursively
        // calls itself on Objects.
        let merger = function (a, b) {
            if (_.isObject(a)) {
                return _.merge({}, a, b, merger);
            }

            return a || b;

        };

        // Allow roles to be passed to _.merge as an array of arbitrary length
        let args = _.flatten([{}, roles, merger]);

        return _.merge.apply(_, args);
    },
    /**
     * @description getting base URL of project
     * @return {string}
     */
    getBaseUrl: () => {
        if (sails.config.custom && sails.config.custom.baseUrl) {
            return sails.config.custom.baseUrl;
        }
        let usingSSL =
            sails.config.ssl && sails.config.ssl.key && sails.config.ssl.cert;
        let port = sails.config.proxyPort || sails.config.port;
        let domain = '';
        let interfaces = require('os').networkInterfaces();
        for (let devName in interfaces) {
            let iface = interfaces[devName];
            for (let i = 0; i < iface.length; i++) {
                let alias = iface[i];
                if (
                    alias.family === 'IPv4' &&
                    alias.address !== '127.0.0.1' &&
                    !alias.internal
                ) {
                    domain = alias.address;
                }
            }
        }
        let localAppURL =
            `${usingSSL ? 'https' : 'http'
            }://${
            domain
            }${port == 80 || port == 443 ? '' : `:${port}`}`;

        return localAppURL;
    },
    randomNumber: (length = 4) => {
        let numbers = '12345678901234567890';
        let result = '';
        for (let i = length; i > 0; --i) {
            result += numbers[Math.round(Math.random() * (numbers.length - 1))];
        }

        return result;
    },
    randomAlphaNumericString: (length = 6) => {
        let numbers = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let result = '';
        for (let i = length; i > 0; --i) {
            result += numbers[Math.round(Math.random() * (numbers.length - 1))];
        }
        return result;

    },
    getPrimaryEmail(emails) {
        if (emails && _.size(emails) > 0) {
            let email = _.find(emails, (email) => {
                return email.isPrimary;
            });

            return email && email.email ? email.email : '';
        }

        return '';
    },

    /**
     * @function generateModelLocalId
     * @description generate local id based on model specified
     * @param options => "{
     *                      "parentId":<string>
     *                   }"
     * @param callback
     */
    generateModelLocalId: function (options, callback) {
        let self = this;
        let Model;
        if (_.isObject(options.model)) {
            Model = options.model;
        } else {
            Model = sails.models[options.model];
        }
        let params = {};
        async.waterfall([
            // get parent location
            function (wcb) {
                let filter = {};
                if (options.parentId) {
                    filter = {
                        where: {
                            id: options.parentId
                        }
                    };
                } else {
                    filter = {
                        where: {
                            parentId: null
                        }
                    };
                }
                filter.sort = 'localIdSequence DESC';
                filter.limit = 1;
                Model.find(filter).exec((err, parents) => {
                    if (err) {
                        callback(err);
                    }

                    if (parents && parents.length) {
                        let parent = parents[0];
                        // set parent local id
                        if (options.parentId) {
                            params.parentLocalId = parent.localId;
                        }
                        wcb(null, parent);
                    } else {
                        wcb(null, undefined);
                    }
                });
            },

            // generate local id
            function (parent, wcb) {
                if (options.parentId && parent) {
                    // find last group sequence record for generate next localId
                    let filter = {
                        where: {
                            parentLocalId: parent.localId
                        }
                    };
                    filter.sort = 'localIdSequence DESC';
                    filter.limit = 1;
                    Model.find(filter).exec((err, lastGroupSequenceRecords) => {
                        if (err) {
                            callback(err);
                        }

                        // if last record available generate local id after that
                        if (lastGroupSequenceRecords && lastGroupSequenceRecords.length) {
                            let lastGroupSequenceRecord = lastGroupSequenceRecords[0];
                            var localOptions = {};
                            localOptions.lastLocalId = parent.localId;
                            localOptions.lastSeqNum = lastGroupSequenceRecord.localIdSequence;
                            localOptions.onlyAlphabet = false; // set alphabet false , due to local id available
                            params.localIdSequence =
                                lastGroupSequenceRecord.localIdSequence + 1;
                            params.lastSeqNum = lastGroupSequenceRecord.localIdSequence + 1; // set last sequence + 1
                            params.localId = self.generateLocalId(localOptions); // generate local id
                            callback(null, params);
                        }
                        // if not available last record , then generate local id based on parent
                        else {
                            var localOptions = {};
                            localOptions.lastLocalId = parent.localId; // set local id of parent
                            localOptions.lastSeqNum = 0; // set last sequence as zero
                            localOptions.onlyAlphabet = false; // set alphabet false , due to local id available
                            params.localIdSequence = 1; // and next sequence as one plus last sequence
                            params.lastSeqNum = 1;
                            params.localId = self.generateLocalId(localOptions);
                            callback(null, params);
                        }
                    });
                }
                // if parent id not available in request, generate new local id
                else {
                    let localOptions = {};
                    localOptions.lastLocalId =
                        parent && parent.localId ? parent.localId : '';
                    localOptions.lastSeqNum =
                        parent && parent.localIdSequence ? parent.localIdSequence || 0 : 0;
                    localOptions.onlyAlphabet = !(parent && options.parentId); // if parent id available in req. set alphabet true, otherwise false
                    params.localIdSequence =
                        parent && parent.localIdSequence ?
                            (parent.localIdSequence || 0) + 1 :
                            1; // if local id sequence available ,increment
                    params.lastSeqNum = localOptions.lastSeqNum;
                    params.localId = self.generateLocalId(localOptions);
                    callback(null, params);
                }
            }
        ]);
    },

    /**
     * Alphabet auto generate sequence array
     * @param options => number        integer     count of total alphabet array sequence
     * @param options => lastLocalId     string      Starting character of sequence
     * @param obj           string      Extra object details
     *                                  only_alphabet: true ? Generate only alphabetic ids : 'A-1-1-'
     * @returns {Array}     array       Array of alphabet sequence
     * ex.
     *  request num : 5
     *          start_cha : "Y" => array start with +1 character
     *  return  array : ["Z", "AA", "AB", "AC", "AD"]
     *
     *  request num : 5
     *          start_cha : "" => array start with +1 character
     *  return  array : ["A", "B", "C", "D", "E"]
     */
    generateLocalId: function (options) {
        // set default parameters, if not available in request
        if (!_.has(options, 'returnString') && !options.returnString) {
            options.returnString = true;
        }
        if (!_.has(options, 'onlyAlphabet') && !options.onlyAlphabet) {
            options.onlyAlphabet = false;
        }
        if (!_.has(options, 'addSuffix') && !options.addSuffix) {
            options.addSuffix = '-';
        }
        if (!_.has(options, 'number') && !options.number) {
            options.number = 1;
        }

        let letters = '';
        let letterSeries = [];
        let i = 1;
        let lastLocalId = options.lastLocalId;
        if (options.onlyAlphabet) {
            lastLocalId = !_.isEmpty(lastLocalId) ?
                _.first(lastLocalId.split('-')) :
                '';

            /**
             * fromLetters => String letter to sequence number
             * ex. A - 1, B - 2, .. , AA - 27
             */
            let baseChar = 1;
            let len = lastLocalId.length;
            let pos = len;
            while ((pos -= 1) > -1) {
                baseChar += (lastLocalId.charCodeAt(pos) - 64) * Math.pow(26, len - 1 - pos);
            }

            /**
             * toLetters => Number to Alphabet letter
             * @param num => Int => ex. 1   2   ..  27
             * @returns {string} => ex. A   B   ..  AA
             */
            var toLetters = function (num) {
                'use strict';
                let mod = num % 26;
                let pow = (num / 26) | 0;
                let out = mod ? String.fromCharCode(64 + mod) : (pow--, 'Z');

                return pow ? toLetters(pow) + out : out;
            };

            do {
                letters = toLetters(baseChar);
                letterSeries.push(letters);
                baseChar += 1;
                i += 1;
            } while (i <= options.number);

            if (
                options &&
                ((options.addPrefix && !_.isEmpty(options.addPrefix)) ||
                    (options.addSuffix && !_.isEmpty(options.addSuffix)))
            ) {
                _.each(letterSeries, (ls, index) => {
                    if (options.addPrefix) {
                        letterSeries[index] = `${options.addPrefix}${ls}`;
                    }
                    if (options.addSuffix) {
                        letterSeries[index] = `${ls}${options.addSuffix}`;
                    }
                });
            }

            if (options.returnString) {
                return _.first(letterSeries);
            }

            return letterSeries;

        }
        options.lastSeqNum = options.lastSeqNum ? options.lastSeqNum : 0;
        let nextId = `${lastLocalId}${options.lastSeqNum + 1}-`;

        return nextId;

    },
    // async getClientIpInfo(ip) {
    //     console.log(ip);
    //     ip = ip.replace('::ffff:', '');
    //     console.log(ip);

    //     return new Promise((resolve, reject) => {
    //         iplocation(ip, [], (error, res) => {
    //             if (error) {
    //                 console.log('failes to find ip details');
    //             }
    //             resolve({
    //                 ip: ip,
    //                 address: {
    //                     country: res && res.country ? res.country : '',
    //                     region: res && res.region ? res.region : '',
    //                     city: res && res.city ? res.city : '',
    //                     postalCode: res && res.postal ? res.postal : '',
    //                     latitude: res && res.latitude ? res.latitude : '',
    //                     longitude: res && res.longitude ? res.longitude : ''
    //                 },
    //                 time: moment().toISOString()
    //             });
    //         });
    //     });
    // },
    doubleDateToString(doubleDate) {
        return doubleDate ?
            moment(doubleDate * 1000 * 60 * 60 * 24).format('MM/DD/YYYY') :
            '';
    },
    doubleDateToISO(doubleDate) {
        return doubleDate ?
            moment(doubleDate * 1000 * 60 * 60 * 24).toISOString() :
            '';
    },
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    },
    convertObjectIdToString(array, key) {
        let response = [];
        _.each(array, (value) => {
            response.push(value[key].toString());
        });

        return response;
    },
    getDateWithCurrentTime(date) {
        let newDate = new Date(date).toTimeString();
        newDate = new Date(`${new Date().toDateString()} ${newDate}`);

        return newDate;
    },
    getStartOfTheDay(date) {
        return `${moment(date).format('YYYY-MM-DD')}T00:00:00.000Z`;
    },
    getEndOfTheDay(date) {
        return `${moment(date).format('YYYY-MM-DD')}T23:59:59.999Z`;
    },
    getStartOfTheDayIso(date) {
        return moment(date).startOf('day').toISOString()
    },
    getEndOfTheDayIso(date) {
        return moment(date).endOf('day').toISOString()
    },
    getTimeFromNow() {
        return moment().toISOString();
    },
    formatDate: (date) => {
        return date ? moment(date).format('MMM DD, YYYY HH:mm:ss a') : '-';
    },
    createDateFromTwoDate(takeDate, takeTime) {
        return moment(`${takeDate} ${takeTime}`, 'DD/MM/YYYY HH:mm').toISOString();
    },
    secondsToTime(secs) {
        var hours = Math.floor(secs / (60 * 60));

        var divisor_for_minutes = secs % (60 * 60);
        var minutes = Math.floor(divisor_for_minutes / 60);

        var divisor_for_seconds = divisor_for_minutes % 60;
        var seconds = Math.ceil(divisor_for_seconds);
        hours = hours > 9 ? hours : `0${hours}`
        minutes = minutes > 9 ? minutes : `0${minutes}`

        var obj = {
            "h": hours,
            "m": minutes,
            "s": seconds
        };
        return obj;
    },
    getPrimaryValue: (array, key) => {
        return array && array.length ? _.find(array, {
            isPrimary: true
        })[key] : '';
    },
    getPrimaryObj: (array) => {
        return array && array.length ? _.find(array, {
            isPrimary: true
        }) : '';
    },
    getTimeDifference(start, end, unit = 'minutes') {
        let time = moment(end).diff(moment(start), 'seconds');
        if (unit === 'minutes') {
            time /= 60;
        }

        return Number(parseFloat(time).toFixed(2));
    },
    addTime(value, time = null, unit = 'minutes') {
        if (time === null) {
            time = moment().toISOString();
        }

        return moment(time).add(value, unit).toISOString();
    },
    getFloat(value) {
        return Number(parseFloat(value).toFixed(2));
    },
    getFloatOnePrecision(value) {
        let result = parseFloat(value).toFixed(1)
        return result
    },
    difference(object, base) {
        function changes(object, base) {
            return _.transform(object, (result, value, key) => {
                if (!_.isEqual(value, base[key])) {
                    result[key] = _.isObject(value) && _.isObject(base[key]) ? changes(value, base[key]) : value;
                }
            });
        }

        return changes(object, base);
    },
    canadaTimezone(timeRef) {
        let time = moment(timeRef);
        let canadianTime = time.utcOffset(-300)

        return canadianTime;
    },
    offsetOnUtc(timeRef, offset) {
        // console.log("off", offset)
        let offsetInt = parseInt(offset)
        let time = moment(timeRef);
        let newTime = time.utcOffset(offsetInt)
        let resTime = moment(newTime).format('DD/MM/YYYY')
        return resTime;
    },
    offsetOnUtcDay(offset) {
        // console.log("off", offset)
        let offsetInt = parseInt(offset)
        let time = moment();
        let newTime = time.utcOffset(offsetInt)
        let resDay = moment(newTime).day()
        return resDay;
    },
    offsetOnUtcTime(timeRef, offset) {
        // console.log("off", offset)
        let offsetInt = parseInt(offset)
        let time = moment(timeRef);
        let newTime = time.utcOffset(offsetInt)
        return newTime;
    },
    formatTimeDuration(time){
        let minutes = Math.floor(time / 60);
        var seconds = time - minutes * 60;
        let str = `${minutes} Minutes, ${seconds} Seconds`
        return str
    },
    convertOmniUTCDate(date, time) {
        let newDate = `${date} ${time}`;

        return moment(newDate, 'DDMMYY HHmmss.SS').toISOString();
    },
    convertKmToMiles(km) {
        if (km <= 0) {
            return km;
        }

        return Number(parseFloat(km / 1.609344).toFixed(2));
    },
    currTimeInYearForIot(date = null) {
        let time = moment();
        if (date) {
            time = moment(date);
        }
        let currTimeInYear = time.utcOffset(0).format('YYMMDDHHmmss');

        return currTimeInYear;
    },
    currTimeInFullYearForIot(date = null) {
        let time = moment();
        if (date) {
            time = moment(date);
        }
        let currTimeInYear = time.utcOffset(0).format('YYYYMMDDHHmmss');

        return currTimeInYear;
    },
    getUnixTimestampInSeconds() {
        let currTime = moment().unix();

        return currTime;
    },
    convertDMSToLocation(latInput, latDirection, lngInput, lngDirection) {
        let latitude = Number(latInput.slice(0, 2)) +
            (Number(latInput.slice(2, 10)) / 60);
        let longitude = Number(lngInput.slice(0, 3)) +
            (Number(lngInput.slice(3, 11)) / 60);

        let { lat, lng } = this.setDirectionWiseLocation(latDirection, lngDirection, latitude, longitude);

        return { lat, lng }
    },

    setDirectionWiseLocation(latDirection, lngDirection, lat, lng) {
        if (latDirection === 'S') {
            lat *= -1;
        }
        if (lngDirection === 'W') {
            lng *= -1;
        }
        console.log("Lat , Long", lat, lng);
        return {
            lat,
            lng
        };
    },

    subtractTime(value, time = null, unit = 'minutes') {
        if (time === null) {
            time = moment().toISOString();
        }

        return moment(time).subtract(value, unit).toISOString();
    },
    getIotCommandExpiryTime() {
        let time = this.addTime(sails.config.IOT_REQUEST_TIME_OUT_LIMIT, null, 'seconds');

        return time;
    },
    hex2Ascii(hex) {
        let ascii = '';
        for (let i = 0; (i < hex.length && hex.substr(i, 2) !== '00'); i += 2)
            ascii += String.fromCharCode(parseInt(hex.substr(i, 2), 16));

        return ascii;
    },

    ascii2Hex(ascii) {
        let hex = '';
        for (let i = 0; i < ascii.length; i++)
            hex += ascii.charCodeAt(i).toString(16);

        return hex;
    },

    hexToDec(hex) {
        let decimalNo = parseInt(hex.toString(), 16);

        return decimalNo;
    },

    decToHex(dec) {
        let hex = dec.toString(16);

        return hex;
    },

    hex2bin(hex) {
        let binary = ("00000000" + (parseInt(hex, 16)).toString(2)).substr(-8);

        return binary;
    },

    getDecimalConvertedObject(data) {
        for (let key in data) {
            data[key] = this.hexToDec(data[key]);
        }

        return data;
    },

    generateMd5Hash(data) {
        const crypto = require('crypto');
        let hash = crypto.createHash('md5').update(data).digest('hex').toLowerCase();

        return hash;
    },

    isDateInRange(startDateRef, endDateRef, dateRef) {
        var date = moment(dateRef);
        var startDate = moment(startDateRef);
        var endDate = moment(endDateRef);
        if (date.isBefore(endDate) && date.isAfter(startDate)) {
            return true
        } else {
            return false
        }
    },

    getNextWeekDates() {
        var aryDates = [];
        let startDate = new Date()
        let daysToAdd = 7
        for (var i = 0; i < daysToAdd; i++) {
            var currentDate = new Date();
            currentDate.setDate(startDate.getDate() + i);
            aryDates.push(currentDate.toISOString());
        }
        //console.log(aryDates)
        return aryDates;
    },
    getNextWeekDatesFromDate(date) {
        var aryDates = [];
        // console.log
        let daysToAdd = 7
        for (var i = 0; i < daysToAdd; i++) {
            let startDate = new Date(date)
            var currentDate = new Date();
            currentDate= new Date(startDate.getTime() + i*24 * 60 * 60 * 1000);
            aryDates.push(currentDate.toISOString());
        }
        // console.log("aryDates")
        // console.log(aryDates)
        return aryDates;
    },
    //last week sunday to saturday dates
    getLastWeekDates() {
        var aryDates = [];
        var startDate = moment().subtract(1, 'week').startOf('week');
        startDate = new Date(startDate)
        let daysToAdd = 7
        for (var i = 0; i < daysToAdd; i++) {
            var currentDate = new Date();
            currentDate.setDate(startDate.getDate() + i);
            aryDates.push(currentDate.toISOString());
        }
        //console.log(aryDates)
        return aryDates;
    },
    addDays(days) {
        var date = new Date()
        var resultRef = new Date(date);
        resultRef.setDate(resultRef.getDate() + days);
        let result = resultRef.toISOString()
        //console.log(result)
        return result;
    },
    groupByDate(myArray) {
        let dayOfWeekArray = ['Sun','Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        var group_to_values = myArray.reduce(function (obj, item) {
            obj[item.startTimeTimezone] = obj[item.startTimeTimezone] || [];
            obj[item.startTimeTimezone].push(item);
            return obj;
        }, {});

        var groups = Object.keys(group_to_values).map(function (key) {
            var dateString = key; 
            var dateParts = dateString.split("/");
            var dateObject = new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]); 
            let dayOfWeekNumberRef = new Date(dateObject)
            let dayOfWeekNumber = dayOfWeekNumberRef.getDay()
            let dayOfWeek = dayOfWeekArray[dayOfWeekNumber]
            let hasAvailableSlots = group_to_values[key].length ? true : false
            let dateRef = dayOfWeekNumberRef
            return { 
                date: dateRef,
                dayOfWeek:dayOfWeek, 
                dayOfWeekNumber:dayOfWeekNumber, 
                hasAvailableSlots: hasAvailableSlots,
                availableSlots: group_to_values[key] };
        });

        return groups
    },
    reorderArrayByIndex(array, index) {
        array.push(...array.splice(0, index));
        return array
    },
    getMinutesOfDay(date) {
        let dateMoment = new Date(date)
        return dateMoment.getMinutes() + dateMoment.getHours() * 60;
    },
    getMinutesOfDayUtc(date) {
        let dateIso = new Date(date).toISOString()
        let time = dateIso.split('T')[1]
        var a = time.split(':'); 
        var minutes = (+a[0]) * 60 + (+a[1]); 
        return minutes
    },
    getAge(birthDateString) {
        var today = new Date();
        var birthDate = new Date(birthDateString);
        var age = today.getFullYear() - birthDate.getFullYear();
        var m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    },
    nextDateFromDayOfWeek(x, offset) {
        console.log("x",x)
        console.log("offset",offset)
        var now = new Date();
        let nowNow = new Date();
        let realNow = new Date();
        console.log("nowa", now)
        now.setDate(now.getDate() + (x + (7 - now.getDay())) % 7);
        console.log("nowff", now)
        console.log("nowdd", realNow)
        let nowUtcOffset = this.offsetOnUtcTime(now, offset)
        let realNowUtcOffset = this.offsetOnUtcTime(realNow, offset)
        console.log("nn", nowUtcOffset)
        console.log("rn", realNowUtcOffset)
        if(nowUtcOffset < realNowUtcOffset){
            console.log("got here")
            now = now.setDate(now.getDate() + (x + (7 - now.getDay())) % 7);
            realNow = realNow.setDate(now.getDate() + (x + (14 - now.getDay())) % 14);
            return realNow
        }
        console.log("nowb", now)
        return now;
    },
    // nextDateFromDayOfWeek(x) {
    //     console.log("x",x)
    //     var now = new Date();
    //     var nowRef = new Date();
    //     now.setDate(now.getDate() + (x + (7 - now.getDay())) % 7);
    //     var newDate = new Date(now)
    //     console.log("nowb",now)
    //     if(newDate.getTime() < nowRef.getTime()){
    //         console.log("in if")
    //         now.setDate((new Date(now)).getDate() + (x + (7 - now.getDay())) % 7);
    //     }
    //     console.log("nowa", now)
    //     return now; 
    // },
    getYesterdaysDate() {
        var date = new Date();
        var dateRef = new Date()
        date.setDate(date.getDate()-1);
        let dateDay = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate()
        let dateMonth = (date.getMonth()+1) < 10 ? `0${date.getMonth()+1}` : date.getMonth()+1
        return dateDay + '/' + dateMonth + '/' + date.getFullYear();
    },
    getNextWeekLastDate() {
        var aryDates = [];
        let startDate = new Date()
        let daysToAdd = 7
        for (var i = 0; i < daysToAdd; i++) {
            var currentDate = new Date();
            currentDate.setDate(startDate.getDate() + i);
            aryDates.push(currentDate.toISOString());
        }
        let lastDateRef = aryDates[aryDates.length - 1];
        let lastDateRefRef = lastDateRef.split('T')[0]
        let dateArray = lastDateRefRef.split('-')
        let lastDate = `${dateArray[2]}/${dateArray[1]}/${dateArray[0]}`
        return lastDate
    },
    sortByDateObj(objArray){
        let sorted = objArray.sort(function(a, b){
            var c = a.startTimeTimezone
            var d = b.startTimeTimezone
            var aa = c.split('/').reverse().join(),
                bb = d.split('/').reverse().join();
            return aa < bb ? -1 : (aa > bb ? 1 : 0);
        });
        return sorted
    },
    makeIntervals(startDate, endDate, interval) {
        var start = moment(startDate);
        var end = moment(endDate);
    
        var result = [];
    
        var current = moment(start);
    
        while (current <= end) {
            result.push(current.toISOString());
            current.add(interval, 'minutes');
        }
    
        return result;
    },
    convertMinutes(num){
        let d = Math.floor(num/1440); // 60*24
        let h = Math.floor((num-(d*1440))/60);
        let m = Math.round(num%60);
        let str = ""
      
        if(d>0){
            let abbr = d > 1 ? "days" : "day"
            str = str + `${d} ${abbr} `
        }
        if(h>0){
            let abbr = h > 1 ? "hours" : "hour"
            str = str + `${h} ${abbr} `
        }
        if(m>0){
            let abbr = m > 1 ? "minutes" : "minute"
            str = str + `${m} ${abbr} `
        }
        return str
    }
};