'use strict';

const form = document.getElementById('calculateIP');

form.addEventListener('submit', calcIP);

function calcIP (event) {
    const valuesFromForm = getValuesFromForm();
    showResults(valuesFromForm);
    event.preventDefault();
}

function getValuesFromForm() {
    const form = document.forms.calculateIP;
    const ipFromForm = form.elements.ipAddress.value;
    const prefixNetFromForm = form.elements.netmask.value;
    // const prefixSubNetFromForm = form.elements.subnetmask.value;
    return {
        ipFromForm: ipFromForm,
        prefixNetFromForm: prefixNetFromForm,
        //prefixSubNetFromForm: prefixSubNetFromForm
    }
}

function showResults (obj) {
    document.getElementById("resultIP").innerHTML = obj.ipFromForm;
    document.getElementById("resultIPBin").innerHTML = calculateBinIp(obj.ipFromForm);
    document.getElementById("resultNetMask").innerHTML = `${getNetMask(obj.prefixNetFromForm).maskResultDec}=${obj.prefixNetFromForm}`;
    document.getElementById("resultNetMaskBin").innerHTML = `${getNetMask(obj.prefixNetFromForm).maskResultBin}`;

    const addrNetDec = calculateNetOrBroadAddress(obj.ipFromForm,obj.prefixNetFromForm,'0').addrStrDec;
    const addrBroadDec = calculateNetOrBroadAddress(obj.ipFromForm,obj.prefixNetFromForm,'1').addrStrDec;

    const addrMinMaxHosts = calculateMaxMinHosts(addrNetDec, addrBroadDec);
    
    document.getElementById("resultNetDecAddr").innerHTML = `${addrNetDec}`;
    document.getElementById("resultNetBinAddr").innerHTML = `${calculateNetOrBroadAddress(obj.ipFromForm,obj.prefixNetFromForm,'0').addrStrBin}`;
    document.getElementById("resultBroadcastDecAddr").innerHTML = `${addrBroadDec}`;
    document.getElementById("resultBroadcastBinAddr").innerHTML = `${calculateNetOrBroadAddress(obj.ipFromForm,obj.prefixNetFromForm,'1').addrStrBin}`;

    document.getElementById("resultHostMin").innerHTML = `${addrMinMaxHosts.addrMin}`;
    document.getElementById("resultHostMax").innerHTML = `${addrMinMaxHosts.addrMax}`;
    document.getElementById("resultNumberHosts").innerHTML = `${calculateNumHosts(obj.prefixNetFromForm)}`;
}

function calculateBinIp(str) {
    const numsStr = str.split('.');
    const numsInt = [];
    for (let i = 0; i < 4; i++) {
        numsInt.push(parseInt(numsStr[i]));
    } 
    const numsBin = [];
    for (let i = 0; i < 4; i++) {
        numsBin.push(numsInt[i].toString(2));
    }
    const numsBinRight = [];
    for (let i = 0; i < 4; i++) {
        const str = numsBin[i];
        const strArr = str.split('');
        if (strArr.length < 8) {
            const zeros = [];
            for (let i = 0; i < 8 - strArr.length; i++) {
                zeros.unshift('0');
            }
            const num = [...zeros, ...strArr];
            numsBinRight.push(num.join(''));
        } else {
            numsBinRight.push(strArr.join(''));
        }
    }
    return numsBinRight.join('.');
}

function getNetMask (str) {
    const lenMaxAddrNet = 32;
    const lenPrefix = parseInt(str);
    const diff = lenMaxAddrNet - lenPrefix;
    const maskArr = [];
    for (let i = 0; i < lenPrefix; i++) {
        maskArr.push('1');
    }
    for (let i = 0; i < diff; i++) {
        maskArr.push('0');
    }
    const sep = (xs, s) => xs.length ? [xs.slice(0, s), ...sep(xs.slice(s), s)] : [];
    const maskArrSlice = sep(maskArr, 8)
    const resJoin = [];
    for (let i=0; i < 4;i++) {
        resJoin.push(maskArrSlice[i].join(''));
    }
    const maskNetBin = resJoin.join('.');
    const resMaskArr = [];
    for (let i =0; i < 4; i++) {
        resMaskArr.push(parseInt(resJoin[i], 2));
    }
    return {
        maskResultDec: resMaskArr.join('.'),
        maskResultBin: maskNetBin
    };
}

function calculateNetOrBroadAddress(addrDec, prefix, endFill) {
    const lenMaxAddrNet = 32;
    const lenPrefix = parseInt(prefix);
    const diff = lenMaxAddrNet - lenPrefix;
    const addrClean = calculateBinIp(addrDec).replace(/\./g, '');
    const addrNetSubStr = addrClean.slice(0, prefix);
    const addrMaskSubStrArr = [];
    for (let i=0; i < diff;i++) {
        addrMaskSubStrArr.push(endFill);
    }
    const addrMaskSubStr = addrMaskSubStrArr.join('');
    const addrStrNotDot = addrNetSubStr + addrMaskSubStr;
    const addrStrArr = [];
    let i = 0;
    let j = 8;
    while(i < 32){
        addrStrArr.push(addrStrNotDot.slice(i, j));
        i = i + 8;
        j = j + 8;
    }
    const addrDecArr = [];
    for (let i=0;i < 4;i++) {
        addrDecArr.push(parseInt(addrStrArr[i],2));
    }
    const addrStrDecNotPrefix = addrDecArr.join('.');
    let addrStrDec = '';
    if(endFill === '0') {
        addrStrDec = addrStrDecNotPrefix + '/' + prefix;
    }else{
        addrStrDec = addrStrDecNotPrefix;
    }
    const addrStrBin = addrStrArr.join('.');
    return {
        addrStrDec: addrStrDec,
        addrStrBin: addrStrBin
    };
}

function calculateNumHosts(prefix) {
    const lenMaxAddrNet = 32;
    const lenPrefix = parseInt(prefix);
    const diff = lenMaxAddrNet - lenPrefix;
    const numHosts = Math.pow(2, diff) - 2;
    return numHosts;
}

function calculateMaxMinHosts(addrNetDec, addrBroadDec) {
    const addrNetArrWithPrefix = addrNetDec.split('/');
    const addrNetArr = addrNetArrWithPrefix[0].split('.');
    const addrBroadArr = addrBroadDec.split('.');
    const lastOctMin = (parseInt(addrNetArr[3]) + 1).toString();
    const lastOctMax = (parseInt(addrBroadArr[3]) - 1).toString();
    addrNetArr.splice(3,1);
    addrBroadArr.splice(3,1);
    addrNetArr.push(lastOctMin);
    addrBroadArr.push(lastOctMax);
    const addrMin = addrNetArr.join('.');
    const addrMax = addrBroadArr.join('.');
    return {
        addrMin: addrMin,
        addrMax: addrMax
    };
}




