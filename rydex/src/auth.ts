import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import connectDb from "./lib/db"
import User from "./models/user.model"
import bcrypt from "bcryptjs"
import Google from "next-auth/providers/google"
 
async function getDbUserRole(input: {
  id?: string | null;
  email?: string | null;
}) {
  if (!input.id && !input.email) return undefined;

  await connectDb();

  const dbUser = input.id
    ? await User.findById(input.id).select("role").lean()
    : await User.findOne({ email: input.email }).select("role").lean();

  return dbUser?.role;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
        credentials: {
        email: { label: "email",type:"email" },
        password: { label: "password", type: "password" },
      } ,
     async authorize(credentials) {
          if (!credentials?.email || !credentials?.password) {
    throw new Error("Missing credentials")
  }
            await connectDb()
            const email=credentials.email
            const password=credentials.password as string
            const user=await User.findOne({email}).select("name email role password")
            if(!user){
                throw new Error("user does not exist")
            }
            if(!user.password){
                throw new Error("This account uses Google sign-in. Please continue with Google.")
            }
            const isMatch=await bcrypt.compare(password,user.password)
            if(!isMatch){
                throw new Error("incorrect password")
            }
            return {
                id:user._id.toString(),
                email:user.email,
                name:user.name,
                role:user.role
            }

          } 
    
    }),
    Google({
      clientId:process.env.GOOGLE_CLIENT_ID,
      clientSecret:process.env.GOOGLE_CLIENT_SECRET
    })
  ],
  callbacks:{
    async signIn({user,account}) {
      if(account?.provider=="google"){
        if(!user.email){
          return false
        }
        await connectDb()
        let dbUser=await User.findOne({email:user.email})
       if(!dbUser){
         dbUser=await User.create({
          name:user.name,
          email:user.email,
         })
       }

       user.id=dbUser._id.toString()
       user.role=dbUser.role
      }
      return true
    },
    async jwt({token,user,trigger,session}) {
        if(user){
            token.id = user.id
            token.name = user.name
            token.email = user.email
            token.role = user.role
        }

        if(trigger=="update"){
          token.role=session.role
        }

        if (!token.role) {
          const dbRole = await getDbUserRole({
            id: typeof token.id === "string" ? token.id : null,
            email: typeof token.email === "string" ? token.email : null,
          });

          if (dbRole) {
            token.role = dbRole;
          }
        }


        return token
    },
    async session({session,token}) {
        let role = token.role as string | undefined;

        if (!role) {
          role = await getDbUserRole({
            id: typeof token.id === "string" ? token.id : null,
            email: typeof token.email === "string" ? token.email : null,
          });

          if (role) {
            token.role = role;
          }
        }

        if(session.user){
            session.user.id = token.id as string
            session.user.name = token.name as string
            session.user.email = token.email as string
            session.user.role = (role || "user") as string
        }
        return session
    },
  },
  pages:{
    signIn:"/",
    error:"/"
  },
  session:{
    strategy:"jwt",
    maxAge:10*24*60*60
  },
  secret:process.env.AUTH_SECRET
})
