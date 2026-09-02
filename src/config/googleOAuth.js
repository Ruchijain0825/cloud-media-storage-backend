import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { findUserByEmail, createGoogleUser } from "../model/user.model.js";

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails?.[0]?.value;
                const name = profile.displayName;
                const imageUrl = profile.photos?.[0]?.value;
                const googleId = profile.id;

                if (!email) {
                    return done(new Error("Google account email not found"), null);
                }

                let user = await findUserByEmail(email);

                if (!user) {
                    user = await createGoogleUser({
                        email,
                        name,
                        googleId,
                        imageUrl,
                    });
                }

                return done(null, user);
            } catch (error) {
                return done(error, null);
            }
        }
    )
);

export default passport;