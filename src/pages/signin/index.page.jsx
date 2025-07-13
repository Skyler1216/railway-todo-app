import { useCallback, useState } from 'react' // Reactのフックをインポート
import { Navigate } from 'react-router-dom' // リダイレクト用コンポーネント
import { useSelector } from 'react-redux' // Reduxの状態取得フック
import { useLogin } from '~/hooks/useLogin' // カスタムログインフック
import { useId } from '~/hooks/useId' // ユニークID生成フック
import Button from '~/components/ui/Button' // UIボタンコンポーネント
import './index.css' // このページ専用のスタイル

const SignIn = () => {
  const auth = useSelector(state => state.auth.token !== null) // 認証状態を取得（トークンの有無で判定）
  const { login } = useLogin() // ログイン処理関数を取得

  const id = useId() // フォーム要素用のユニークIDを生成
  const [errorMessage, setErrorMessage] = useState('') // エラーメッセージの状態
  const [isSubmitting, setIsSubmitting] = useState(false) // 送信中の状態

  const [email, setEmail] = useState('') // メールアドレスの状態
  const [password, setPassword] = useState('') // パスワードの状態

  const onSubmit = useCallback(
    // useCallback：余計な再レンダリングを防ぐためのフック
    // フォーム送信時の処理（メモ化）
    event => {
      event.preventDefault() // デフォルトの送信動作を防ぐ

      setIsSubmitting(true) // 送信中フラグを立てる

      login({ email, password }) // ログイン処理を実行
        .catch(err => {
          setErrorMessage(err.message) // エラーが発生した場合、エラーメッセージを設定
        })
        .finally(() => {
          setIsSubmitting(false) // 処理完了後、送信中フラグを下げる
        })
    },
    [email, password, login] // 依存配列：これらの値が変更されたら関数を再作成
  )

  if (auth) {
    // 既にログイン済みの場合
    return <Navigate to='/' replace />
  }

  return (
    <main className='signin'>
      {/* メインコンテンツエリア */}
      <h2 className='signin__title'>Login</h2> {/* ページタイトル */}
      <p className='signin__error'>{errorMessage}</p>{' '}
      {/* エラーメッセージ表示エリア */}
      <form className='signin__form' onSubmit={onSubmit}>
        {/* ログインフォーム */}
        <fieldset className='signin__form_field'>
          {/* メールアドレス入力フィールド */}
          <label htmlFor={`${id}-email`} className='signin__form_label'>
            E-mail Address {/* ラベルテキスト */}
          </label>
          <input
            id={`${id}-email`} // ラベルと紐づけるID
            type='email' // メールアドレス入力タイプ
            autoComplete='email' // ブラウザの自動補完
            className='app_input' // 共通の入力スタイル
            value={email} // 現在のメールアドレス値
            onChange={event => setEmail(event.target.value)} // 入力値の変更を状態に反映
          />
        </fieldset>
        <fieldset className='signin__form_field'>
          {/* パスワード入力フィールド */}
          <label htmlFor={`${id}-password`} className='signin__form_label'>
            Password {/* ラベルテキスト */}
          </label>
          <input
            id={`${id}-password`} // ラベルと紐づけるID
            type='password' // パスワード入力タイプ（文字が隠れる）
            autoComplete='current-password' // ブラウザの自動補完
            className='app_input' // 共通の入力スタイル
            value={password} // 現在のパスワード値
            onChange={event => setPassword(event.target.value)} // 入力値の変更を状態に反映
          />
        </fieldset>
        <div className='signin__form_actions'>
          {/* ボタン配置エリア */}
          <Button variant='secondary' to='/signup'>
            {/* サインアップページへのリンクボタン */}
            Register {/* ボタンテキスト */}
          </Button>
          <div className='signin__form_actions_spacer' />
          {/* ボタン間のスペーサー */}
          <Button type='submit' disabled={isSubmitting}>
            {/* ログイン送信ボタン（送信中は無効化） */}
            Login {/* ボタンテキスト */}
          </Button>
        </div>
      </form>
    </main>
  )
}

export default SignIn // コンポーネントをデフォルトエクスポート
