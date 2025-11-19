import { createContext, useContext, useEffect, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db } from '../config/firebase'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState(null)
  const [profileComplete, setProfileComplete] = useState(true) // Default to true for non-clinicians

  async function signup(email, password, name, role = 'patient', extraData = {}) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    if (name) {
      await updateProfile(userCredential.user, { displayName: name })
    }
    
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      uid: userCredential.user.uid,
      email: email,
      name: name,
      role: role,
      createdAt: new Date().toISOString(),
      ...extraData
    })
    
    return userCredential
  }

  async function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password)
  }

  async function loginWithGoogle(role = 'patient') {
    const provider = new GoogleAuthProvider()
    const result = await signInWithPopup(auth, provider)
    
    const userDoc = await getDoc(doc(db, 'users', result.user.uid))
    if (!userDoc.exists()) {
      await setDoc(doc(db, 'users', result.user.uid), {
        uid: result.user.uid,
        email: result.user.email,
        name: result.user.displayName,
        role: role,
        createdAt: new Date().toISOString(),
        profileComplete: role === 'clinician' ? false : true
      })
    }

    // If user is a clinician, check if they have completed their profile
    if (role === 'clinician' || (userDoc.exists() && userDoc.data().role === 'clinician')) {
      try {
        const clinicianDoc = await getDoc(doc(db, 'clinicians', result.user.uid))
        setProfileComplete(clinicianDoc.exists())
      } catch (error) {
        console.error('Error checking clinician profile:', error)
        setProfileComplete(false)
      }
    }
    
    return result
  }

  function logout() {
    return signOut(auth)
  }

  useEffect(() => {
    // Set a timeout to prevent infinite loading if Firebase fails
    const timeout = setTimeout(() => {
      setLoading(false)
    }, 3000)

    try {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        clearTimeout(timeout)
        setUser(user)
        if (user) {
          try {
            const userDoc = await getDoc(doc(db, 'users', user.uid))
            if (userDoc.exists()) {
              const userData = userDoc.data()
              setUserRole(userData.role)
              
              // Check profile completion for clinicians
              if (userData.role === 'clinician') {
                const clinicianDoc = await getDoc(doc(db, 'clinicians', user.uid))
                setProfileComplete(clinicianDoc.exists())
              } else {
                setProfileComplete(true)
              }
            }
          } catch (error) {
            console.error('Error fetching user data:', error)
          }
        } else {
          setUserRole(null)
        }
        setLoading(false)
      })

      return () => {
        clearTimeout(timeout)
        unsubscribe()
      }
    } catch (error) {
      console.error('Firebase auth error:', error)
      clearTimeout(timeout)
      setLoading(false)
    }
  }, [])

  const value = {
    user,
    userRole,
    signup,
    login,
    loginWithGoogle,
    logout,
    loading,
    profileComplete
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
