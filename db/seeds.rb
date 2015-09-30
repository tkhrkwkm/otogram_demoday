Relationship.create!([
  {follower_id: 1, followed_id: 2},
  {follower_id: 1, followed_id: 3},
  {follower_id: 2, followed_id: 1}
])
Timbre.create!([
  {user_id: 1, sound_src: "timbre"},
  {user_id: 1, sound_src: "timbre"},
  {user_id: 1, sound_src: "timbre"},
  {user_id: 1, sound_src: "timbre"},
  {user_id: 1, sound_src: "timbre"}
])
User.create!([
  {name: "Takahiro", email: "tkawakami@tkltd.jp", password_digest: "$2a$10$FDuGIuiwkyznrd9SywO8keO51NnD2HG9nFlDUwjtVwsAQEzUD.3YK"},#tk154500
  {name: "Alexander", email: "user01@tkltd.jp", password_digest: "$2a$10$qyR1ZEz4lcVTFhZy8VMNcugYTk0VL6.xb9QrsZrBEAw4DrMyWENIW"},#test1234
  {name: "Aishah", email: "user02@tkltd.jp", password_digest: "$2a$10$4pKuLgmmZQXjufEN0LNIf.ifkZIqTWVobLC8aTmMOOIKKaU.v3oo."}#test1234
])
