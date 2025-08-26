function customKeyboard(zone, input, onClick, onESC, onEnter, form) {
    /*
        zone : 생성될 위치
        input : 입력할 변수
        onClick : 키보드가 눌렸을때 동작
        onESC : 뒤로 눌렸을때 동작
        form : 키보드의 모습
    */
    var nowlang = "koNormal";
    this.setClick = function(newclick) {
        onClick = newclick;
    }
    this.setEnter = function(Enterfun) {
        onEnter = Enterfun;
    }
    this.setZone = function(newZone) {
        zone = newZone;
    };
    var charlist = [];
    this.setInput = function(inputtag) {
        input = inputtag;
        var sub = Hangul.disassemble("" + input.value);
        charlist = sub;
    }
    function getText() {
        return Hangul.assemble(charlist);
    }
    if(form == null) {
        form = {
            koNormal : [
                ['X','1','2','3','4','5','6','7','8','9','0', '←'],
                ['ㅂ', 'ㅈ', 'ㄷ', 'ㄱ', 'ㅅ', 'ㅛ', 'ㅕ', 'ㅑ', 'ㅐ', 'ㅔ'],
                ['ㅁ','ㄴ','ㅇ','ㄹ','ㅎ','ㅗ','ㅓ','ㅏ','ㅣ', '입력'],
                ['shift','ㅋ','ㅌ','ㅊ','ㅍ','ㅠ','ㅜ','ㅡ','한/영'],
                ["space"]
            ], 
            koShift : [
                ['X','!','@','#','$','%','^','&','*','(',')', '←'],
                ['ㅃ', 'ㅉ', 'ㄸ', 'ㄲ', 'ㅆ', 'ㅛ', 'ㅕ', 'ㅑ', 'ㅒ', 'ㅖ'],
                ['ㅁ','ㄴ','ㅇ','ㄹ','ㅎ','ㅗ','ㅓ','ㅏ','ㅣ', '입력'],
                ['shift','ㅋ','ㅌ','ㅊ','ㅍ','ㅠ','ㅜ','ㅡ','한/영'],
                ["space"]
            ],
            enNormal : [
                ['X','1','2','3','4','5','6','7','8','9','0', '←'],
                ['q','w','e','r','t','y','u','i','o','p'],
                ['a','s','d','f','g','h','j','k','l','입력'],
                ['shift','z','x','c','v','b','n','m','한/영'],
                ["space"]
            ],
            enShift : [
                ['X','!','@','#','$','%','^','&','*','(',')', '←'],
                ['Q','W','E','R','T','Y','U','I','O','P'],
                ['shift','Z','X','C','V','B','N','M','한/영'],
                ["space"]
            ],
            phoneNumber : [
                ['1','2','3'],
                ['4','5','6'],
                ['7','8','9'],
                ['X','0','←'],
                ['입력']
            ],
            numberOnly : [
                ['1','2','3'],
                ['4','5','6'],
                ['7','8','9'],
                ['','0','←'],
                ['입력']
            ]
        }
    }
    
    // form이 문자열인 경우 해당 레이아웃만 사용
    var targetForm = {};
    if (typeof form === 'string') {
        // 문자열로 전달된 경우 해당 레이아웃만 사용
        if (form === 'phoneNumber') {
            targetForm = {
                phoneNumber: [
                    ['1','2','3'],
                    ['4','5','6'],
                    ['7','8','9'],
                    ['X','0','←'],
                    ['입력']
                ]
            };
            nowlang = 'phoneNumber';
        } else {
            // 기본 form 사용
            targetForm = form;
        }
    } else {
        // 객체로 전달된 경우 그대로 사용
        targetForm = form;
    }
    
    // 기존 키보드 제거
    zone.innerHTML = '';
    
    var keydiv = {};
    for (let index = 0; index < Object.keys(targetForm).length; index++) {
        keydiv[Object.keys(targetForm)[index]] = document.createElement("div");
        keydiv[Object.keys(targetForm)[index]].style.cssText = `
            position: absolute;
            width: 100%;
            height: 100%;
            visibility: hidden;
            font-size: 25px;
            background: #ffffff;
            padding: 10px;
            box-sizing: border-box;
        `;
        
        for (let i = 0; i < targetForm[Object.keys(targetForm)[index]].length; i++) {
            var keyline = document.createElement("table");
            keyline.style.cssText = `
                width: 66.67%;
                margin: 0 auto;
                height: auto;
                border-collapse: separate;
                border-spacing: 2px;
                margin-bottom: ${i === targetForm[Object.keys(targetForm)[index]].length - 1 ? '0px' : '4px'};
                table-layout: fixed;
            `;
            
            var row = document.createElement("tr");
            row.style.cssText = `
                height: auto;
                min-height: 40px;
            `;
            
            for (let j = 0; j < targetForm[Object.keys(targetForm)[index]][i].length; j++) {
                var key = document.createElement("td");
                key.style.cssText = `
                    padding: 6px 4px;
                    font-weight: normal;
                    font-size: 20px;
                    color: #333;
                    text-align: center;
                    vertical-align: middle;
                    margin: 1px;
                    border: 1px solid #ddd;
                    background: white;
                    cursor: pointer;
                    user-select: none;
                    min-width: 30px;
                    width: auto;
                    height: 45px;
                    transition: all 0.2s ease;
                    box-sizing: border-box;
                    border-radius: 0;
                `;
                
                key.innerText = targetForm[Object.keys(targetForm)[index]][i][j];
                
                // 빈 키는 클릭 불가능하게 처리
                if (targetForm[Object.keys(targetForm)[index]][i][j] === '') {
                    key.style.visibility = 'hidden';
                    key.style.pointerEvents = 'none';
                } else {
                    // X 키는 특별한 스타일 적용
                    if (targetForm[Object.keys(targetForm)[index]][i][j] === 'X') {
                        key.style.background = '#F8D1E7';
                        key.style.color = 'black';
                        key.style.fontSize = '18px';
                        key.style.fontWeight = '500';
                        key.style.boxShadow = '0 2px 4px rgba(248, 209, 231, 0.3)';
                        key.style.minWidth = '60px';
                        key.style.borderRadius = '0';
                    }
                    // 입력 키는 특별한 스타일 적용
                    if (targetForm[Object.keys(targetForm)[index]][i][j] === '입력') {
                        key.style.background = '#F8D1E7';
                        key.style.color = 'black';
                        key.style.fontSize = '18px';
                        key.style.fontWeight = '500';
                        key.style.boxShadow = '0 2px 4px rgba(248, 209, 231, 0.3)';
                        key.style.borderRadius = '0';
                    }
                    // ← 키는 특별한 스타일 적용
                    if (targetForm[Object.keys(targetForm)[index]][i][j] === '←') {
                        key.style.background = '#F8D1E7';
                        key.style.color = 'black';
                        key.style.fontSize = '18px';
                        key.style.fontWeight = '500';
                        key.style.boxShadow = '0 2px 4px rgba(248, 209, 231, 0.3)';
                        key.style.borderRadius = '0';
                    }
                    // shift 키는 특별한 스타일 적용
                    if (targetForm[Object.keys(targetForm)[index]][i][j] === 'shift') {
                        key.style.background = '#F8D1E7';
                        key.style.color = 'black';
                        key.style.fontSize = '18px';
                        key.style.fontWeight = '500';
                        key.style.boxShadow = '0 2px 4px rgba(248, 209, 231, 0.3)';
                        key.style.borderRadius = '0';
                    }
                    // 한/영 키는 특별한 스타일 적용
                    if (targetForm[Object.keys(targetForm)[index]][i][j] === '한/영') {
                        key.style.background = '#F8D1E7';
                        key.style.color = 'black';
                        key.style.fontSize = '16px';
                        key.style.fontWeight = '500';
                        key.style.boxShadow = '0 2px 4px rgba(248, 209, 231, 0.3)';
                        key.style.borderRadius = '0';
                    }
                    // space 키는 일반 키와 동일한 스타일 적용
                    if (targetForm[Object.keys(targetForm)[index]][i][j] === 'space') {
                        key.style.background = 'white';
                        key.style.color = '#333';
                        key.style.fontSize = '20px';
                        key.style.fontWeight = 'normal';
                        key.style.border = '1px solid #ddd';
                        key.style.height = '45px';
                        key.style.minHeight = '45px';
                        key.style.padding = '6px 4px';
                        key.style.verticalAlign = 'middle';
                        key.style.lineHeight = 'normal';
                        key.style.boxShadow = 'none';
                        key.colSpan = targetForm[Object.keys(targetForm)[index]][i].length;
                    }
                    
                    key.addEventListener("click", keyfun);
                    
                    // 일반 키들에 호버 효과 추가 (space 키 포함)
                    if (!['X', '입력', '←', 'shift', '한/영'].includes(targetForm[Object.keys(targetForm)[index]][i][j])) {
                        key.addEventListener('mouseenter', function() {
                            this.style.background = '#f8f9fa';
                            this.style.transform = 'scale(1.05)';
                            this.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                        });
                        
                        key.addEventListener('mouseleave', function() {
                            this.style.background = 'white';
                            this.style.transform = 'scale(1)';
                            this.style.boxShadow = 'none';
                        });
                    }
                }
                
                row.appendChild(key);
            }
            
            keyline.appendChild(row);
            keydiv[Object.keys(targetForm)[index]].appendChild(keyline);
        }
        
        zone.appendChild(keydiv[Object.keys(targetForm)[index]]);
    }
    
    // koNormal 레이아웃만 표시
    keydiv[nowlang].style.visibility = "visible";
    
    function keyfun() {
        if(this.innerText == 'X') {
            // 키보드 닫기 (ESC 기능과 동일)
            if(onESC != null) {
                onESC();
            }
            return;
        } else if(this.innerText == '입력') {
            onEnter(getText());
            return;
        } else if(this.innerText == '한/영') {
            keydiv[nowlang].style.visibility = "hidden";
            if(nowlang == "koNormal") {
                nowlang = "enNormal";
            } else if(nowlang == "enNormal") {
                nowlang = "koNormal";
            } else if(nowlang == "koShift") {
                nowlang = "enShift";
            } else if(nowlang == "enShift") {
                nowlang = "koShift";
            }
            keydiv[nowlang].style.visibility = "visible";
            return;
        } else if(this.innerText == 'shift') {
            keydiv[nowlang].style.visibility = "hidden";
            if(nowlang == "koNormal") {
                nowlang = "koShift";
            } else if(nowlang == "enNormal") {
                nowlang = "enShift";
            } else if(nowlang == "koShift") {
                nowlang = "koNormal";
            } else if(nowlang == "enShift") {
                nowlang = "enNormal";
            }
            keydiv[nowlang].style.visibility = "visible";
            return;
        } else if(this.innerText == '←') {
            charlist.splice(charlist.length - 1, 1);
        } else if(this.innerText == 'space') {
            charlist.push(" ");
        } else {
            charlist.push(this.innerText);
        }
        
        var text = Hangul.assemble(charlist);
        input.value = text;
        if(onClick != null) {
            onClick(getText());
        }
    }
}