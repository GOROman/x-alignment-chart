# X アラインメントチャート

X（旧Twitter）ユーザーのD&Dスタイルのアラインメントチャートを作成します。AIによるツイート分析に基づいて、または手動でユーザーを秩序-混沌と善-悪のグリッド上に配置できます。[Exa](https://exa.ai/)と[Vercel AI SDK](https://sdk.vercel.ai)を使用しています。

こちらで試せます！ → [magic-x-alignment-chart.vercel.app](https://dub.sh/magic-x-alignment-chart/)

https://github.com/user-attachments/assets/2e5e2587-468e-4a77-ac59-742c92f8d58a

## 使い方

1. 入力欄にXのユーザー名を入力
2. 以下のいずれかを選択：
   - **AI分析**（紫色のボタン）：ユーザーのツイートを分析してチャート上に配置
   - **ランダム配置**（黒色のボタン）：手動配置用にユーザーをランダムに配置
3. 配置されたユーザーのアラインメントチャートを表示
4. ロックされていないユーザーをドラッグして位置を変更（AI配置のユーザーはロックされています）
5. チャートの軸のラベルをクリックして各アラインメントの詳細を確認

## 開発環境のセットアップ

1. 使用したいAIプロバイダー（OpenAI（デフォルト）、Anthropicなど）のアカウントを作成し、APIキーを取得
2. [Upstash Redis](https://upstash.com/)でRedis DBをセットアップ
3. `.env.example`をもとに`.env.local`ファイルを作成
4. `bun install`で依存関係をインストール
5. `bun dev`で開発サーバーを起動

## 独自のデプロイ

[![Deploy with Vercel](https://vercel.com/button)]([https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Ff1shy-dev%2Fx-alignment-chart](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Ff1shy-dev%2Fx-alignment-chart%2F&env=OPENAI_API_KEY,EXA_API_KEY&integration-ids=oac_V3R1GIpkoJorr6fqyiwdhl17))

## クレジット

- オリジナルのコンセプト：[mdmatthewdc](https://x.com/mdmathewdc/status/1899767815344722325)
- Draggable v0：[rauchg](https://x.com/rauchg/status/1899895262023467035)
- AIバージョン（このバージョン）：[f1shy-dev](https://x.com/vishyfishy2/status/1899929030620598508)
