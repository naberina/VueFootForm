(() => {
  "use strict";
  kintone.events.on("app.record.index.show", (event) => {
    if (event.viewId !== 1234567) return; // ★TODO: カスタマイズビューを確認してviewIdを変更する
    new Vue({
      el: "#app",
      data: {
        startFlg: "",
        keyValue: "",
        currentQuestionCounts: 0, // 質問回答数（初期値: 0)
        TotalQuestionCounts: 3, // 質問の総数
        currentQuestion: "", // 現在の質問内容
        // 質問を配列に入れる
        questions: [
          "餃子は",
          "餃子といえば",
          "どのくらいの頻度で餃子を食べますか",
        ],
        questionKeyValueA: ["好き", "焼き餃子", "毎日"], // Aの回答を配列に入れる
        questionKeyValueB: ["普通", "水餃子", "週に1回以上"], // Bの回答を配列に入れる
        questionKeyValueC: ["苦手", "揚げ餃子", "月に1回以上"], // Cの回答を配列に入れる
        currentquestionKeyValueA: "", // Aの回答（表示用）
        currentquestionKeyValueB: "", // Bの回答（表示用）
        currentquestionKeyValueC: "", // Cの回答（表示用）
        submitVal: "",
        submitParams: [], // kintoneに送信するパラメータを配列に入れておく
        width: "", // Progressバーの長さ
        color: "", // Progressバーの色
      },
      methods: {
        AnswerStart: function () {
          this.startFlg = true;
        },
        onKeyDown: function (key) {
          this.keyValue = key;
        },
      },
      computed: {
        styleObject: function () {
          this.width = 33.3 * this.currentQuestionCounts + "%";
          if (this.currentQuestionCounts == this.TotalQuestionCounts) {
            this.color = "#ffc107";
          } else {
            this.color = "#ffeb3b";
          }
          return {
            width: this.width,
            "background-color": this.color,
          };
        },
      },
      // 最初に読み込まれるため、初期値を設定しておく
      mounted: function () {
        console.log(this.currentQuestionCounts);
        this.currentQuestion = this.questions[0];
        this.currentquestionKeyValueA = this.questionKeyValueA[0];
        this.currentquestionKeyValueB = this.questionKeyValueB[0];
        this.currentquestionKeyValueC = this.questionKeyValueC[0];
        document.body.addEventListener("keydown", (event) => {
          if (event.key) {
            this.onKeyDown(event.key);
          }
        });
      },
      // 更新イベントを受け取って処理する
      watch: {
        keyValue: function (getKeyVal) {
          if (getKeyVal == "Enter") this.startFlg = true;
          if (this.currentQuestionCounts > 3 || getKeyVal == "Shift")
            location.reload();

          if (getKeyVal == "a" || getKeyVal == "b" || getKeyVal == "c") {
            if (getKeyVal == "a") {
              this.submitVal =
                this.questionKeyValueA[this.currentQuestionCounts];
            } else if (getKeyVal == "b") {
              this.submitVal =
                this.questionKeyValueB[this.currentQuestionCounts];
            } else {
              this.submitVal =
                this.questionKeyValueC[this.currentQuestionCounts];
            }
            this.currentQuestionCounts += 1;
            this.questions.splice(0, 1);
            this.currentQuestion = this.questions[0];
            this.currentquestionKeyValueA =
              this.questionKeyValueA[this.currentQuestionCounts];
            this.currentquestionKeyValueB =
              this.questionKeyValueB[this.currentQuestionCounts];
            this.currentquestionKeyValueC =
              this.questionKeyValueC[this.currentQuestionCounts];
            this.submitParams.push(this.submitVal); // 回答結果をkintoneにPOSTするため配列に入れておく
            this.keyValue = ""; //同じキーを判別できないため,クリアしておく

            if (this.submitParams.length == this.TotalQuestionCounts) {
              //kintoneにRESTでPOSTする
              let body = {
                app: kintone.app.getId(),
                record: {
                  question1: {
                    value: this.submitParams[0],
                  },
                  question2: {
                    value: this.submitParams[1],
                  },
                  question3: {
                    value: this.submitParams[2],
                  },
                },
              };

              kintone.api(
                kintone.api.url("/k/v1/record.json", true),
                "POST",
                body,
                (resp) => {
                  console.log(resp);
                },
                (error) => {
                  console.log(error);
                }
              );
            }
          }
        },
      },
    });
  });
})();
