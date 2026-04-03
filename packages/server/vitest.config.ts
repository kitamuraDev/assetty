import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    reporters: ['verbose'],

    // ファイル間で並列実行すると、DBのREADでロックがかかってしまうため直列実行するようにする
    fileParallelism: false,

    // trueにしたいところだが、beforeEachでDBのテーブルリセットを行なっていないため、trueだと更新が走ったタイミングで必ずテストが失敗してしまうため例外的にfalseを設定している経緯がある
    // 一般的に本物のDBを使うテストではbeforeEachでDBのテーブルを都度リセットするのがテストの分離性の観点から好ましいとされている
    watch: false,
  },
});
